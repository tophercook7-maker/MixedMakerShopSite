def _execute_scout_job(
    job_id: str,
    user_id: str | None,
    workspace_id: str | None,
    workspace_plan: str,
    current_lat: float | None,
    current_lng: float | None,
    scan_settings: dict | None = None,
) -> None:
    current_stage: str | None = None
    persistence_debug = {
        "scout_run_saved": False,
        "opportunities_created": 0,
        "opportunities_updated": 0,
        "case_files_created": 0,
        "case_files_updated": 0,
        "leads_created": 0,
        "duplicates_skipped": 0,
        "workspace_id": workspace_id,
        "backend_supabase_url": _supabase_url,
        "backend_admin_supabase_url": CRM_SUPABASE_URL,
        "admin_supabase_url": CRM_SUPABASE_URL,
        "backend_supabase_url_host": urlparse(_supabase_url or "").netloc or None,
        "backend_admin_supabase_url_host": urlparse(CRM_SUPABASE_URL or "").netloc or None,
        "admin_supabase_url_host": urlparse(CRM_SUPABASE_URL or "").netloc or None,
        "supabase_url_present": bool(_supabase_url),
        "supabase_service_key_present": bool(_supabase_service_key),
        "reduced_mode_notice": None,
        "places_reduced_mode": False,
        "errors": [],
    }

    def _runner_progress_update(payload: dict) -> None:
        nonlocal current_stage
        if _job_is_cancelled(job_id):
            return
        stage = str(payload.get("stage") or "").strip() or None
        progress = int(payload.get("progress") or 0)
        message = str(payload.get("message") or "").strip() or "Scout running..."
        if stage and stage != current_stage:
            current_stage = stage
            print(f"  job stage changed: {stage}")
        _job_progress(
            job_id,
            progress,
            status="running",
            result_summary=message,
            stage=stage,
        )

    job = _job_update(
        job_id,
        status="running",
        started_at=_job_now_iso(),
        progress=10,
        message="Scout job queued",
        result_summary="Scout job queued",
        stage="queued",
    )
    if job:
        print("  scout job started")
        _upsert_job_supabase(job)
        if user_id:
            _checkpoint_scout_run_supabase(user_id, workspace_id, job)
    try:
        if not _supabase_url:
            persistence_debug["errors"].append(
                {
                    "stage": "runtime_config",
                    "error": "backend Supabase URL missing (SUPABASE_URL)",
                    "required_env": "SUPABASE_URL",
                }
            )
        if not _supabase_service_key:
            persistence_debug["errors"].append(
                {
                    "stage": "runtime_config",
                    "error": "backend service role key missing (SUPABASE_SERVICE_ROLE_KEY)",
                    "required_env": "SUPABASE_SERVICE_ROLE_KEY",
                }
            )
        if not workspace_id:
            persistence_debug["errors"].append(
                {
                    "stage": "workspace_resolution",
                    "error": "workspace_id unresolved before scout execution",
                    "fallback_workspace_env_present": bool(_workspace_env_fallback_id()),
                }
            )
        if _job_is_cancelled(job_id):
            cancelled = _job_update(
                job_id,
                status="cancelled",
                progress=100,
                message="Scout cancelled",
                result_summary="Scout cancelled",
                stage="cancelled",
                finished_at=_job_now_iso(),
                error=None,
            )
            if cancelled:
                _upsert_job_supabase(cancelled)
            return
        _job_progress(
            job_id,
            10,
            status="running",
            result_summary="Discovery started",
            stage="discovering_businesses",
        )
        if user_id:
            _checkpoint_scout_run_supabase(user_id, workspace_id, _job_get(job_id))
        _run_morning_runner(
            current_lat=current_lat,
            current_lng=current_lng,
            scan_settings=scan_settings or {},
            progress_callback=_runner_progress_update,
            cancel_callback=lambda: _job_is_cancelled(job_id),
        )
        if _job_is_cancelled(job_id):
            cancelled = _job_update(
                job_id,
                status="cancelled",
                progress=100,
                message="Scout cancelled",
                result_summary="Scout cancelled",
                stage="cancelled",
                finished_at=_job_now_iso(),
                error=None,
            )
            if cancelled:
                print("  scout job cancelled")
                _upsert_job_supabase(cancelled)
            return
        _job_progress(
            job_id,
            90,
            status="running",
            result_summary="Generating dossiers",
            stage="generating_dossiers",
        )
        if user_id:
            _checkpoint_scout_run_supabase(user_id, workspace_id, _job_get(job_id))

        data = _load_scout_data()
        today = data["today"]
        opportunities = data["opportunities"]
        reduced_mode_notice = str((today or {}).get("reduced_mode_notice") or "").strip() or None
        _append_history(len(opportunities), today.get("summary", ""))
        _job_progress(
            job_id,
            96,
            status="running",
            result_summary="Saving results",
            stage="saving_results",
        )
        if user_id:
            _checkpoint_scout_run_supabase(user_id, workspace_id, _job_get(job_id))

        sync_stats = {"inserted": 0, "updated": 0, "duplicate_skipped": 0}
        intake_stats = None
        if user_id and _supabase_url and _supabase_service_key:
            sync_stats = _sync_scout_to_supabase(
                user_id,
                workspace_id=workspace_id,
                workspace_plan=workspace_plan,
            ) or sync_stats
            intake_workspace_id = (
                str(sync_stats.get("resolved_workspace_id") or "").strip()
                or str(workspace_id or "").strip()
            )
            if not intake_workspace_id:
                persistence_debug["errors"].append(
                    {
                        "stage": "workspace_resolution",
                        "error": "No workspace_id resolved for CRM intake",
                        "requested_workspace_id": workspace_id,
                        "sync_resolved_workspace_id": sync_stats.get("resolved_workspace_id"),
                    }
                )
            scout_run_checkpoint_ok = _checkpoint_scout_run_supabase(
                user_id,
                workspace_id,
                _job_get(job_id),
                today=today,
                opportunities=opportunities,
                sync_stats=sync_stats,
            )
            persistence_debug["scout_run_saved"] = bool(scout_run_checkpoint_ok)
            persistence_debug["opportunities_created"] = int(sync_stats.get("opportunities_inserted") or 0)
            persistence_debug["opportunities_updated"] = int(sync_stats.get("opportunities_updated") or 0)
            persistence_debug["case_files_created"] = int(sync_stats.get("inserted") or 0)
            persistence_debug["case_files_updated"] = int(sync_stats.get("updated") or 0)
            persistence_debug["duplicates_skipped"] = int(sync_stats.get("duplicate_skipped") or 0)
            persistence_debug["workspace_id"] = intake_workspace_id or workspace_id
            _log_write_stage(
                "opportunities",
                "insert_succeeded",
                {
                    "workspace_id": intake_workspace_id or workspace_id,
                    "attempted": int(sync_stats.get("opportunities_attempted") or 0),
                    "inserted": int(sync_stats.get("opportunities_inserted") or 0),
                    "updated": int(sync_stats.get("opportunities_updated") or 0),
                    "failed": int(sync_stats.get("opportunities_failed") or 0),
                },
            )
            _log_write_stage(
                "case_files",
                "insert_succeeded",
                {
                    "workspace_id": intake_workspace_id or workspace_id,
                    "attempted": int(sync_stats.get("case_files_attempted") or 0),
                    "inserted": int(sync_stats.get("inserted") or 0),
                    "updated": int(sync_stats.get("updated") or 0),
                    "duplicates": int(sync_stats.get("duplicate_skipped") or 0),
                    "failed": int(sync_stats.get("case_files_failed") or 0),
                },
            )
            if sync_stats.get("opportunities_failed"):
                persistence_debug["errors"].append(
                    {
                        "stage": "opportunities",
                        "failed": int(sync_stats.get("opportunities_failed") or 0),
                        "samples": sync_stats.get("opportunity_errors") or [],
                    }
                )
            if sync_stats.get("case_files_failed"):
                persistence_debug["errors"].append(
                    {
                        "stage": "case_files",
                        "failed": int(sync_stats.get("case_files_failed") or 0),
                        "samples": sync_stats.get("case_file_errors") or [],
                    }
                )
            try:
                from supabase import create_client

                sb = create_client(_supabase_url, _supabase_service_key)
                intake_stats = _run_workspace_crm_intake(
                    sb,
                    {"id": intake_workspace_id},
                    user_id,
                    debug_mode=True,
                )
                persistence_debug["leads_created"] = int((intake_stats or {}).get("created") or 0)
                persistence_debug["intake"] = {
                    "workspace_id": intake_workspace_id,
                    "opportunities_found": int((intake_stats or {}).get("opportunities_found") or 0),
                    "opportunities_loaded": int((intake_stats or {}).get("opportunities_loaded") or 0),
                    "total_records": int((intake_stats or {}).get("total_records") or (intake_stats or {}).get("scanned_count") or 0),
                    "opportunities_evaluated": int((intake_stats or {}).get("opportunities_evaluated") or 0),
                    "evaluated": int((intake_stats or {}).get("evaluated") or 0),
                    "eligible_for_lead_creation": int((intake_stats or {}).get("eligible_for_lead_creation") or 0),
                    "eligible": int((intake_stats or {}).get("eligible") or 0),
                    "leads_created": int((intake_stats or {}).get("leads_created") or 0),
                    "created": int((intake_stats or {}).get("created") or 0),
                    "duplicates_skipped": int((intake_stats or {}).get("duplicates_skipped") or 0),
                    "duplicate_skipped": int((intake_stats or {}).get("duplicate_skipped") or 0),
                    "insert_failed": int((intake_stats or {}).get("insert_failed") or 0),
                    "filtered_out": int((intake_stats or {}).get("filtered_out") or 0),
                    "filtered_low_score": int((intake_stats or {}).get("filtered_low_score") or 0),
                    "filtered_missing_contact_path": int((intake_stats or {}).get("filtered_missing_contact_path") or 0),
                    "filtered_missing_email": int((intake_stats or {}).get("filtered_missing_email") or 0),
                    "filtered_missing_opportunity_reason": int((intake_stats or {}).get("filtered_missing_opportunity_reason") or 0),
                    "filtered_closed_or_dnc": int((intake_stats or {}).get("filtered_closed_or_dnc") or 0),
                    "filtered_missing_business_name": int((intake_stats or {}).get("filtered_missing_business_name") or 0),
                    "filtered_missing_workspace": int((intake_stats or {}).get("filtered_missing_workspace") or 0),
                    "filtered_existing_linked_opportunity": int((intake_stats or {}).get("filtered_existing_linked_opportunity") or 0),
                    "duplicate_by_website": int((intake_stats or {}).get("duplicate_by_website") or 0),
                    "duplicate_by_phone": int((intake_stats or {}).get("duplicate_by_phone") or 0),
                    "duplicate_by_business_name_city": int((intake_stats or {}).get("duplicate_by_business_name_city") or 0),
                    "reason_counts": (intake_stats or {}).get("reason_counts") or {},
                    "leads_with_email": int((intake_stats or {}).get("leads_with_email") or 0),
                    "leads_with_phone": int((intake_stats or {}).get("leads_with_phone") or 0),
                    "leads_with_contact_page": int((intake_stats or {}).get("leads_with_contact_page") or 0),
                    "leads_with_facebook": int((intake_stats or {}).get("leads_with_facebook") or 0),
                    "leads_with_no_contact_path": int((intake_stats or {}).get("leads_with_no_contact_path") or 0),
                    "websites_found": int((intake_stats or {}).get("websites_found") or 0),
                    "emails_found": int((intake_stats or {}).get("emails_found") or (intake_stats or {}).get("leads_with_email") or 0),
                    "businesses_found": int((intake_stats or {}).get("opportunities_found") or (intake_stats or {}).get("opportunities_loaded") or 0),
                    "phones_found": int((intake_stats or {}).get("phones_found") or (intake_stats or {}).get("leads_with_phone") or 0),
                    "contact_pages_found": int((intake_stats or {}).get("contact_pages_found") or (intake_stats or {}).get("leads_with_contact_page") or 0),
                    "facebook_links_found": int((intake_stats or {}).get("facebook_links_found") or (intake_stats or {}).get("leads_with_facebook") or 0),
                    "records_with_no_contact": int((intake_stats or {}).get("records_with_no_contact") or (intake_stats or {}).get("leads_with_no_contact_path") or 0),
                    "no_website_found": int((intake_stats or {}).get("no_website_found") or 0),
                    "facebook_found": int((intake_stats or {}).get("leads_with_facebook") or 0),
                    "phone_found": int((intake_stats or {}).get("leads_with_phone") or 0),
                    "no_contact_path": int((intake_stats or {}).get("leads_with_no_contact_path") or 0),
                    "facebook_only": int((intake_stats or {}).get("leads_facebook_only") or 0),
                    "phone_only": int((intake_stats or {}).get("leads_phone_only") or 0),
                    "leads_created_with_website": int((intake_stats or {}).get("leads_created_with_website") or 0),
                    "leads_created_without_website": int((intake_stats or {}).get("leads_created_without_website") or 0),
                    "actionable_email_leads_created": int((intake_stats or {}).get("actionable_email_leads_created") or 0),
                    "leads_skipped_due_no_email": int((intake_stats or {}).get("leads_skipped_due_no_email") or 0),
                    "leads_created_with_low_score": int((intake_stats or {}).get("leads_created_with_low_score") or 0),
                    "leads_created_high_score": int((intake_stats or {}).get("leads_created_high_score") or 0),
                    "query_error": (intake_stats or {}).get("query_error"),
                    "intake_threshold_used": (intake_stats or {}).get("intake_threshold_used"),
                }
                _log_write_stage(
                    "leads_intake",
                    "insert_succeeded",
                    {
                        "workspace_id": intake_workspace_id or workspace_id,
                        "created": int((intake_stats or {}).get("created") or 0),
                        "eligible": int((intake_stats or {}).get("eligible") or 0),
                        "duplicates": int((intake_stats or {}).get("duplicate_skipped") or 0),
                        "failed": int((intake_stats or {}).get("insert_failed") or 0),
                    },
                )
                _process_workspace_outreach_sequences(workspace_id or "", user_id)
                if reduced_mode_notice:
                    reduced_payload = _run_reduced_mode_enrichment(
                        sb,
                        workspace_id=intake_workspace_id or workspace_id or "",
                        owner_id=user_id,
                        scan_settings=scan_settings or {},
                    )
                    reduced_stats = (reduced_payload or {}).get("stats") or {}
                    reduced_opps = (reduced_payload or {}).get("opportunities") or []
                    if reduced_opps:
                        opportunities = reduced_opps
                        today = {
                            **(today or {}),
                            "summary": reduced_mode_notice,
                            "top_opportunities": reduced_opps[:10],
                            "case_slugs": [],
                            "reduced_mode_notice": reduced_mode_notice,
                        }
                        try:
                            with open(TODAY_PATH, "w", encoding="utf-8") as f:
                                json.dump(today, f, indent=2)
                            with open(OPPORTUNITIES_PATH, "w", encoding="utf-8") as f:
                                json.dump(reduced_opps, f, indent=2)
                        except Exception as write_err:
                            print(f"  [Scout] reduced-mode file refresh failed: {write_err}", file=sys.stderr)
                    persistence_debug["reduced_mode_notice"] = reduced_mode_notice
                    persistence_debug["places_reduced_mode"] = True
                    persistence_debug["intake"] = {
                        **(persistence_debug.get("intake") or {}),
                        "google_discovery_used": False,
                        "reduced_mode": True,
                        "stored_records_scanned": int(reduced_stats.get("stored_records_scanned") or 0),
                        "total_records": int(reduced_stats.get("stored_records_scanned") or 0),
                        "websites_found": int(reduced_stats.get("stored_records_scanned") or 0),
                        "records_enriched": int(reduced_stats.get("records_enriched") or 0),
                        "emails_found": int(reduced_stats.get("emails_found") or 0),
                        "phones_found": int(reduced_stats.get("phone_found") or reduced_stats.get("phone_founds") or 0),
                        "contact_pages_found": int(reduced_stats.get("contact_pages_found") or 0),
                        "facebook_links_found": int(reduced_stats.get("facebook_found") or 0),
                        "records_with_no_contact": int(reduced_stats.get("no_contact_path") or 0),
                        "facebook_found": int(reduced_stats.get("facebook_found") or 0),
                        "phone_found": int(reduced_stats.get("phone_found") or 0),
                        "no_contact_path": int(reduced_stats.get("no_contact_path") or 0),
                        "facebook_only": int(reduced_stats.get("facebook_only") or 0),
                        "phone_only": int(reduced_stats.get("phone_only") or 0),
                        "actionable_email_leads": int(reduced_stats.get("actionable_email_leads") or 0),
                        "contact_available": int(reduced_stats.get("contact_available") or 0),
                        "research_later": int(reduced_stats.get("research_later") or 0),
                        "door_to_door_candidates": int(reduced_stats.get("door_to_door_candidates") or 0),
                        "skipped": int(reduced_stats.get("skipped") or 0),
                    }
            except Exception as intake_error:
                print(f"  [Scout] crm intake after run failed: {intake_error}", file=sys.stderr)
                persistence_debug["errors"].append(
                    {"stage": "leads_intake", "error": _safe_error_payload(intake_error)}
                )
            current_job = _job_get(job_id) or {}
            _job_update(
                job_id,
                payload={**(current_job.get("payload") or {}), "persistence_debug": persistence_debug},
            )
        else:
            persistence_debug["errors"].append(
                {
                    "stage": "persistence",
                    "error": "persistence skipped because user_id or Supabase backend env is missing",
                    "user_id_present": bool(user_id),
                    "supabase_url_present": bool(_supabase_url),
                    "supabase_service_key_present": bool(_supabase_service_key),
                }
            )

        processed = int((today or {}).get("processed_count") or len(opportunities))
        saved = int((today or {}).get("saved_count") or len(opportunities))
        skipped = int((today or {}).get("skipped_count") or max(0, processed - saved))
        reduced_mode_notice = str((today or {}).get("reduced_mode_notice") or "").strip() or None
        if reduced_mode_notice:
            persistence_debug["reduced_mode_notice"] = reduced_mode_notice
            persistence_debug["places_reduced_mode"] = True
        scout_summary = {
            "cities_scanned": int((today or {}).get("cities_scanned") or 0),
            "industries_scanned": int((today or {}).get("industries_scanned") or 0),
            "businesses_found": int((today or {}).get("businesses_found") or len(opportunities)),
            "high_score_opportunities": int((today or {}).get("high_score_opportunities") or 0),
            "leads_created": int((intake_stats or {}).get("created") or 0),
        }
        summary = (
            f"Scout complete — {len(opportunities)} leads discovered. "
            f"Processed {processed}, saved {saved}, skipped {skipped}. "
            f"Cities {scout_summary['cities_scanned']}, industries {scout_summary['industries_scanned']}, "
            f"high score opportunities {scout_summary['high_score_opportunities']}, "
            f"CRM leads created {scout_summary['leads_created']}. "
            f"Case files: inserted {int(sync_stats.get('inserted') or 0)}, "
            f"updated {int(sync_stats.get('updated') or 0)}, "
            f"skipped duplicates {int(sync_stats.get('duplicate_skipped') or 0)}."
        )
        if reduced_mode_notice:
            summary = f"{reduced_mode_notice} {summary}"
        finished = _job_update(
            job_id,
            status="completed",
            progress=100,
            message=summary,
            result_summary=summary,
            finished_at=_job_now_iso(),
            error=None,
            stage="finished",
        )
        if finished:
            print("  scout job finished")
            finished["payload"] = {
                **(finished.get("payload") or {}),
                "persistence_debug": persistence_debug,
                "scout_summary": scout_summary,
            }
            _upsert_job_supabase(finished)
            if user_id:
                _checkpoint_scout_run_supabase(
                    user_id,
                    workspace_id,
                    finished,
                    today=today,
                    opportunities=opportunities,
                    sync_stats=sync_stats,
                )
    except Exception as e:
        if ScoutRunError and isinstance(e, ScoutRunError) and e.error_type == "cancelled":
            cancelled = _job_update(
                job_id,
                status="cancelled",
                progress=100,
                message="Scout cancelled",
                result_summary="Scout cancelled",
                finished_at=_job_now_iso(),
                error=None,
                stage="cancelled",
            )
            if cancelled:
                print("  scout job cancelled")
                _upsert_job_supabase(cancelled)
                if user_id:
                    _checkpoint_scout_run_supabase(user_id, workspace_id, cancelled)
            return
        failed = _job_update(
            job_id,
            status="failed",
            progress=100,
            error=str(e),
            finished_at=_job_now_iso(),
            message="Scout job failed",
            result_summary="Scout job failed",
            stage="failed",
        )
        print("  scout job failed")
        if failed:
            persistence_debug["errors"].append({"stage": "scout_job", "error": _safe_error_payload(e)})
            failed["payload"] = {**(failed.get("payload") or {}), "persistence_debug": persistence_debug}
            _upsert_job_supabase(failed)
            if user_id:
                _checkpoint_scout_run_supabase(user_id, workspace_id, failed)
