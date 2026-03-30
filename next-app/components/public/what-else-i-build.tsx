import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Secondary “what else I build” section (web + legacy 3D card).
 * Not imported on the live homepage — kept for reuse; `/3d-printing` remains available as a route.
 */
const SHOW_LEGACY_3D_CARD_IN_WHAT_ELSE = false;

export function WhatElseIBuild() {
  return (
    <section className="mx-auto mt-14 max-w-5xl" aria-labelledby="what-else-i-build-heading">
      <h2
        id="what-else-i-build-heading"
        className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.22em] text-slate-400"
      >
        What else I build
      </h2>
      <div
        className={`grid gap-6 ${SHOW_LEGACY_3D_CARD_IN_WHAT_ELSE ? "md:grid-cols-2" : "md:grid-cols-1 md:max-w-lg md:mx-auto"}`}
      >
        <Card className="rounded-[28px] border border-emerald-400/20 bg-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <CardContent className="flex h-full flex-col p-6 md:p-7">
            <h3 className="text-xl font-semibold text-white">Web Design</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">
              I build websites designed to bring you real customers.
            </p>
            <Button
              asChild
              className="mt-6 w-full gap-2 rounded-2xl bg-emerald-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-emerald-300 sm:w-auto"
            >
              <Link href="/web-design">
                View Web Design <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        {SHOW_LEGACY_3D_CARD_IN_WHAT_ELSE ? (
          <Card className="rounded-[28px] border border-sky-400/20 bg-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <CardContent className="flex h-full flex-col p-6 md:p-7">
              <h3 className="text-xl font-semibold text-white">3D Printing</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">
                Custom 3D printed designs, prototypes, and practical builds.
              </p>
              <Button
                asChild
                className="mt-6 w-full gap-2 rounded-2xl bg-sky-400 px-6 py-6 text-base font-semibold text-slate-950 hover:bg-sky-300 sm:w-auto"
              >
                <Link href="/3d-printing">
                  Explore 3D Printing <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
