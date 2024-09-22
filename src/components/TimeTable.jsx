import PropTypes from "prop-types";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const TimeTable = ({
  state,
  handleMonthChange,
  handleWeekChange,
  formatDate,
  renderCalendar,
  daysOfWeek,
  renderTimeSlots,
  message,
}) => {
  return (
    <>
      {/* 日期選擇器 */}
      <div className="mb-4 mr-4">
        <div className="mx-2 flex items-center justify-between pb-4">
          <button onClick={(e) => handleMonthChange(e, -1)}>
            <CaretLeft className="size-6" />
          </button>
          <div>{formatDate(state.currentMonth, "MMM yyyy")}</div>
          <button onClick={(e) => handleMonthChange(e, 1)}>
            <CaretRight className="size-6" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
            <div key={index} className="text-center font-bold">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
        <p className="mx-2 mt-4 text-sm text-zinc-400">{message}</p>
      </div>
      <div className="flex flex-col">
        {/* 切換周的按鈕 */}
        <div className="mx-3 flex items-center justify-between pb-4">
          <button onClick={(e) => handleWeekChange(e, -1)}>
            <CaretLeft className="size-6" />
          </button>
          <div>
            {formatDate(state.startOfWeek, "MM-dd")} -{" "}
            {formatDate(
              new Date(state.startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000),
              "MM-dd",
            )}
          </div>
          <button onClick={(e) => handleWeekChange(e, 1)}>
            <CaretRight className="size-6" />
          </button>
        </div>

        {/* 顯示七天 */}
        <div className="grid grid-cols-7 gap-3">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-yellow-950"
            >
              <div>{formatDate(day, "EEE")}</div> {/* 星期 */}
              <div>{formatDate(day, "dd")}</div> {/* 日期 */}
            </div>
          ))}
        </div>
        {/* 時間段 */}
        <div className="mt-1 grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => (
            <div key={day}>{renderTimeSlots(day)}</div>
          ))}
        </div>
      </div>
    </>
  );
};

TimeTable.propTypes = {
  state: PropTypes.object.isRequired,
  handleMonthChange: PropTypes.func.isRequired,
  handleWeekChange: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  renderCalendar: PropTypes.func.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  renderTimeSlots: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default TimeTable;
