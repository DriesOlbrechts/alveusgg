import useLocaleString from "@/hooks/locale";
import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";

const useLocaleDays = (hours: number) => {
  const localeDays = useLocaleString(Math.floor(hours / 24));

  return `${hours % 24 === 0 ? "" : "~"}${localeDays} day${Math.floor(hours / 24) !== 1 ? "s" : ""}`;
};

const useLocaleHours = (hours: number, showDays: boolean) => {
  const localeHours = useLocaleString(hours);
  const localeDays = useLocaleDays(hours);

  return `${localeHours} hour${hours !== 1 ? "s" : ""}${showDays ? ` (${localeDays})` : ""}`;
};

const targetIntervals = [24 * 180, 24 * 90, 24 * 30, 24 * 2];

const getTarget = (hours: number) => {
  const multiple = targetIntervals.find((interval) => interval <= hours) ?? 24;
  return Math.ceil((hours + 1) / multiple) * multiple;
};

const GiveAnHourProgressText = ({
  isLoading,
  hours,
  target,
}: {
  isLoading?: boolean;
  hours: number;
  target: number;
}) => {
  // Show the equivalent number of days if we're over 72 hours
  const showDays = target > 72;
  const localeHours = useLocaleHours(hours, showDays);
  const localeTarget = useLocaleHours(target, showDays);

  return (
    <div className="flex justify-between px-2">
      <p className="font-semibold">
        {isLoading
          ? "Loading hours given…"
          : hours === 0
            ? "No hours given yet"
            : `${localeHours} already given`}
      </p>
      <p className="font-medium opacity-75">{localeTarget} target</p>
    </div>
  );
};

const barClasses =
  "absolute inset-y-0 left-0 min-w-10 rounded-full border-4 border-alveus-green-900 transition-all duration-[2s] ease-in-out";

export const GiveAnHourProgress = ({
  target,
  text = "after",
}: {
  target?: number;
  text?: "after" | "before";
}) => {
  const hoursQuery = trpc.showAndTell.getGiveAnHourProgress.useQuery(
    undefined,
    {
      refetchInterval: 5 * 60 * 1000,
    },
  );
  const hours = hoursQuery.data ?? 0;
  const computedTarget = target ?? getTarget(hours);

  return (
    <>
      {text === "before" && (
        <GiveAnHourProgressText
          isLoading={hoursQuery.isPending}
          hours={hours}
          target={computedTarget}
        />
      )}

      <div className="relative my-1 h-10 w-full rounded-full bg-alveus-green-900 shadow-lg">
        <div
          className={classes(barClasses, "bg-alveus-green")}
          style={{ width: `${(hours / computedTarget || 0) * 100}%` }}
        />

        <div
          className={classes(
            barClasses,
            "bg-alveus-tan bg-gradient-to-r from-blue-800 to-green-600",
            hours === 0 ? "opacity-0" : "animate-pulse-slow",
          )}
          style={{ width: `${(hours / computedTarget || 0) * 100}%` }}
        />
      </div>

      {text === "after" && (
        <GiveAnHourProgressText
          isLoading={hoursQuery.isPending}
          hours={hours}
          target={computedTarget}
        />
      )}
    </>
  );
};
