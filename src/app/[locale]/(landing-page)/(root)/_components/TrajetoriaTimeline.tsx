"use client";

import { AnimateIn } from "@/components/AnimateIn";
import { EditableText } from "@/components/admin/EditableText";
import { useLandingContent } from "@/context/LandingContentContext";
import { festivalApi } from "@/lib/api/festival-api";
import type { LandingItem } from "@/lib/landing/types";

export const TrajetoriaTimeline = ({ items }: { items: LandingItem[] }) => {
  const { replaceItem } = useLandingContent();
  const timelineData = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  async function updateItem(item: LandingItem, payload: Record<string, unknown>, token: string) {
    const updatedItem = await festivalApi.updateItem(item.id, payload, token);
    replaceItem(updatedItem);
  }

  return (
    <section className="w-full overflow-hidden bg-background py-40">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="relative hidden h-[600px] lg:block">
          <div className="absolute left-0 top-1/2 z-0 h-4 w-full -translate-y-1/2 bg-secondary" />

          <div className="relative z-10 flex h-full items-center justify-between px-10">
            {timelineData.map((event, index) => {
              const isRosa = index % 2 === 0;
              const currentHeight = isRosa ? "h-[220px]" : "h-[60px]";
              const bgColor = isRosa ? "bg-espacos-magenta" : "bg-secondary";

              return (
                <div key={event.id} className="relative flex flex-1 flex-col items-center">
                  <div className="absolute bottom-1/2 mb-8 flex w-[150px] flex-col items-center">
                    <AnimateIn delay={index * 100}>
                      <div
                        className={`flex min-h-[180px] items-center justify-center rounded-[2.5rem] p-6 text-center shadow-elevated ${bgColor}`}
                      >
                        <EditableText
                          value={event.description ?? ""}
                          multiline
                          onSave={(value, token) => updateItem(event, { description: value }, token)}
                        >
                          {(text) => (
                            <p className="text-[13px] font-semibold leading-[1.4] text-[#0B1B12]">
                              {text}
                            </p>
                          )}
                        </EditableText>
                      </div>

                      <div className={`mx-auto w-2 ${currentHeight} ${bgColor}`} />
                    </AnimateIn>
                  </div>

                  <div
                    className={`z-20 flex h-20 w-20 items-center justify-center rounded-full text-lg font-black text-[#0B1B12] shadow-xl ${bgColor}`}
                  >
                    <EditableText
                      value={event.value ?? ""}
                      onSave={(value, token) => updateItem(event, { value }, token)}
                    >
                      {(text) => <span>{text}</span>}
                    </EditableText>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex flex-col gap-12 pl-4 lg:hidden">
          <div className="absolute bottom-0 left-[40px] top-0 z-0 w-2 bg-secondary" />

          {timelineData.map((event, index) => {
            const isRosa = index % 2 === 0;
            const colorClass = isRosa ? "bg-espacos-magenta" : "bg-secondary";

            return (
              <div key={event.id} className="relative flex items-center">
                <div
                  className={`z-20 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#0B1B12] shadow-lg ${colorClass}`}
                >
                  <EditableText
                    value={event.value ?? ""}
                    onSave={(value, token) => updateItem(event, { value }, token)}
                  >
                    {(text) => <span>{text}</span>}
                  </EditableText>
                </div>

                <div className={`z-10 -ml-1 h-1 w-6 shrink-0 ${colorClass}`} />

                <AnimateIn delay={index * 80} className="flex-1">
                  <div
                    className={`rounded-2xl p-5 text-sm font-bold text-[#0B1B12] shadow-lg ${colorClass}`}
                  >
                    <EditableText
                      value={event.description ?? ""}
                      multiline
                      onSave={(value, token) => updateItem(event, { description: value }, token)}
                    >
                      {(text) => <span>{text}</span>}
                    </EditableText>
                  </div>
                </AnimateIn>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
