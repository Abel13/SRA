"use client";
import { useEffect, useState } from "react";
import {
  endOfMonth,
  format,
  isSameMonth,
  lastDayOfWeek,
  startOfMonth,
  subDays,
  endOfToday,
  addDays,
  endOfDay,
  startOfDay,
  isEqual,
  isThisMonth,
} from "date-fns";

type IDay = {
  date: Date;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  isSelected?: boolean;
};

export default function Home() {
  const today = endOfToday();
  const lastDay = endOfMonth(today);
  const firstSaturday = lastDayOfWeek(startOfMonth(today));
  const lastSaturday = lastDayOfWeek(lastDay);

  const [days, setDays] = useState<IDay[]>([]);
  const [SRAList, setSRA] = useState<
    {
      text: string;
      file: string;
    }[]
  >([]);

  const buildFiles = (SRA: { text: string; file: string }) => {
    const blob = new Blob([SRA.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = SRA.file;
    a.click();
  };

  const buildSRA = () => {
    let text = "";
    let SRAList = [];
    const IS = process.env.NEXT_PUBLIC_IS;
    const PHONE = process.env.NEXT_PUBLIC_PHONE;
    const NAME = process.env.NEXT_PUBLIC_NAME;

    for (
      var currentDate = days[0].date;
      currentDate < lastSaturday;
      currentDate = addDays(currentDate, 2)
    ) {
      const weekNumber = format(currentDate, "w");
      const year = format(currentDate, "yyyy");
      let sumHours = 0;
      let workHours = "";
      for (let i = 0; i < 5; i++) {
        const dayOff = days
          .filter((d) => d.isSelected)
          .find((d: IDay) => isEqual(endOfDay(d.date), endOfDay(currentDate)));

        if (dayOff || !isThisMonth(currentDate)) {
          workHours += "0\t";
        } else {
          workHours += "8\t";
          sumHours += 8;
        }
        currentDate = addDays(currentDate, 1);
      }

      text += `${IS}\t${weekNumber}\tSFSM\t${year}\t${sumHours}\t4\t7/1/2001\t${format(
        today,
        "M/d/yyyy"
      )}\t12/31/2001\t${PHONE}\t${NAME}\t\t\t\n`;
      text += `${IS}\tPPTRS01\t${weekNumber}\t${year}\t1\tDAP\t0\t`;
      text += workHours;
      text += "0\t0\n";
      for (let i = 2; i <= 41; i++) {
        text += `${IS}\t0\t${weekNumber}\t${year}\t${i}\t0\t0\t0\t0\t0\t0\t0\t0\t0\n`;
      }

      SRAList.push({
        text,
        file: `${IS}_${today.getFullYear()}_${weekNumber}.TXT`,
      });
      text = "";
    }

    setSRA(SRAList);
  };

  useEffect(() => {
    let days: IDay[] = [];

    for (let i = 5; i > 0; i--) {
      const date = subDays(firstSaturday, i);
      days.push({
        date,
        isCurrentMonth: isSameMonth(date, today),
      });
    }

    for (
      var currentDay = firstSaturday;
      currentDay < startOfDay(lastDay);
      currentDay = addDays(currentDay, 1)
    ) {
      days.push({
        date: currentDay,
        isCurrentMonth: true,
      });
    }

    for (
      currentDay = lastDay;
      currentDay <= addDays(endOfDay(lastSaturday), 1);
      currentDay = addDays(currentDay, 1)
    ) {
      days.push({
        date: currentDay,
        isCurrentMonth: isSameMonth(currentDay, today),
      });
    }

    setDays(days);
  }, []);

  function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div>
        <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500 text-center">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
        <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
          {days.map((day, dayIdx) => (
            <button
              key={day.date.toString()}
              type="button"
              className={classNames(
                "py-1.5 hover:bg-gray-100 focus:z-10",
                day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                (day.isSelected || day.isToday) && "font-semibold",
                day.isSelected && "text-white",
                !day.isSelected &&
                  day.isCurrentMonth &&
                  !day.isToday &&
                  "text-gray-900",
                !day.isSelected &&
                  !day.isCurrentMonth &&
                  !day.isToday &&
                  "text-gray-400",
                day.isToday && !day.isSelected && "text-indigo-600",
                dayIdx === 0 && "rounded-tl-lg",
                dayIdx === 6 && "rounded-tr-lg",
                dayIdx === days.length - 7 && "rounded-bl-lg",
                dayIdx === days.length - 1 && "rounded-br-lg"
              )}
              onClick={() => {
                setDays(
                  days.map((d) => {
                    if (d.date === day.date) {
                      return { ...d, isSelected: !d.isSelected };
                    }
                    return d;
                  })
                );
              }}
            >
              <time
                dateTime={day.date.toString()}
                className={classNames(
                  "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                  day.isSelected && day.isToday && "bg-indigo-600",
                  day.isSelected && !day.isToday && "bg-gray-900"
                )}
              >
                {format(day.date, "dd")}
              </time>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-8 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={buildSRA}
        >
          Gerar SRA
        </button>
        <div className="mt-4 text-white">
          {SRAList.map((sra) => {
            return (
              <>
                <div
                  key={sra.file}
                  className="flex justify-between m-2 items-center"
                >
                  <p>{sra.file}</p>
                  <div
                    onClick={() => buildFiles(sra)}
                    className="text-indigo-600 cursor-pointer hover:text-indigo-400 ml-2 px-2 py-1 rounded-md bg-indigo-100 hover:bg-indigo-200 text-xs"
                  >
                    baixar
                  </div>
                </div>
                <div className="relative">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300 mb-2" />
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </main>
  );
}
