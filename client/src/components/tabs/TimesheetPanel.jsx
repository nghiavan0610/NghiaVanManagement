import { Badge, Box, Button, ButtonGroup, Divider, Flex, FormControl, FormLabel, IconButton, Input, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverFooter, PopoverTrigger, Table, Td, Tooltip, Tr, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import '../../css/additional-styles/timesheet.scss'
import { FaChevronLeft, FaChevronRight, FaDownload, FaRegStickyNote } from 'react-icons/fa'
import { MdToday, MdEditNote, MdInsertDriveFile, MdOutlineInsertDriveFile, MdOutlineNotes } from 'react-icons/md';
import TimesheetFileUpload from "../modals/TimesheetFileUpload";
import TimesheetViewFile from "../modals/TimesheetViewFile";
import AddCommentForTimesheet from "../modals/AddCommentForTimesheet";
import { axios_instance } from "../../utils/axios";
import { showToast } from "../../utils/toast";

function TimesheetPanel({ timesheet, slug, isManager, isLeader, isMember, isAdmin }) {
  let currentDate = new Date();
  let currentDay = currentDate.getDate();
  let [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  let [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  firstDayOfMonth = firstDayOfMonth == 0 ? 7 : firstDayOfMonth;
  const mondayOffset = firstDayOfMonth - 1;


  let endOfPreviousMonth = new Date(currentYear, currentMonth, 0);
  let endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
  let endOfNextMonth = new Date(currentYear, currentMonth + 2, 0);

  function isToday(day, month, year) {
    return day === currentDay && month === currentDate.getMonth() && year === currentDate.getFullYear()
  }

  return <>
    <div className="flex justify-end gap-2 items-center mb-3 -mt-14">
      <div className="flex items-center gap-2 ">
        <Button
          leftIcon={<MdToday />}
          onClick={() => {
            setCurrentMonth(currentDate.getMonth());
            setCurrentYear(currentDate.getFullYear());
          }}
        >
          Hôm nay
        </Button>
        <div className="flex gap-8 items-center">
          <IconButton icon={<FaChevronLeft />} onClick={() => {
            if (currentMonth > 0)
              setCurrentMonth(currentMonth - 1)
            else {
              setCurrentMonth(11)
              setCurrentYear(currentYear - 1)
            }
          }}></IconButton>
          <div className="flex flex-col items-center">
            <p className="font-bold text-md mt-2">{`Tháng ${currentMonth + 1}`}</p>
            <p className="text-md text-sm -mt-1">{`Năm ${currentYear}`}</p>
          </div>
          <IconButton icon={<FaChevronRight />} onClick={() => {
            if (currentMonth < 11)
              setCurrentMonth(currentMonth + 1)
            else {
              setCurrentMonth(0)
              setCurrentYear(currentYear + 1)
            }
          }}></IconButton>
        </div>
      </div>
      <Divider orientation='vertical' h='10' />
      <div>
        {(isManager || isLeader || isAdmin) &&
          <>
            <Button
              className='ml-auto mr-2'
              leftIcon={<FaDownload />}
              onClick={() => {
                const monthYear = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`
                const timesheetId = timesheet.find((ts) => ts.monthYear === monthYear)?._id;
                axios_instance
                  .post(`/projects/${slug}/timesheet/download`, { timesheetId: timesheetId }, {
                    responseType: "arraybuffer",
                  })
                  .then(function (response) {
                    const url = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    saveAs(url, `ChamCong_${monthYear}.xlsx`);
                    showToast('success', "Bảng chấm công đã được tải xuống!")
                  })
                  .catch(function (error) {
                    showToast('error', "Lỗi khi tải bảng chấm công!")
                    console.log(error);
                  });
              }}
            >Tải bảng chấm công</Button>
            <AddCommentForTimesheet timesheetId={timesheet._id} slug={slug}>
              <Button
                className='ml-auto mr-2'
                leftIcon={<MdEditNote color='#fff' />}
                background='primary'
                color='white'
              >
                Thêm / sửa ghi chú
              </Button>
            </AddCommentForTimesheet>
          </>
        }
        <TimesheetFileUpload timesheetId={timesheet._id} slug={slug}>
          <Button
            className='ml-auto'
            leftIcon={<MdInsertDriveFile color='#fff' />}
            background='primary'
            color='white'
          >
            Thêm tệp
          </Button>
        </TimesheetFileUpload>
      </div>
    </div>

    <Table className="timesheet border-collapse border border-slate-500">
      <Tr>
        <Td>Thứ 2</Td>
        <Td>Thứ 3</Td>
        <Td>Thứ 4</Td>
        <Td>Thứ 5</Td>
        <Td>Thứ 6</Td>
        <Td>Thứ 7</Td>
        <Td>Chủ nhật</Td>
      </Tr>
      {
        Array(parseInt((endOfCurrentMonth.getDate() + mondayOffset) / 7) + 1).fill().map((_, week) => {
          return <Tr>{
            Array(7).fill().map((_, day) => {
              if (day < mondayOffset && week === 0) {
                let dayOffset = endOfPreviousMonth.getDate() - mondayOffset + 1 + day
                return <Td className="text-black text-opacity-50 h-[110px]">
                  <div className="flex absolute top-0.5 right-0.5">
                    <div class={`m-3 flex h-6 w-6 mx-auto my-auto items-center justify-center`}>
                      {/* <p>{dayOffset}</p> */}
                    </div>
                  </div>
                </Td>
              } else if (7 * week + day >= mondayOffset && 7 * week + day < endOfCurrentMonth.getDate() + mondayOffset) {
                const _day = 7 * week + day - mondayOffset + 1
                const currentMonthYear = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
                const currentMonthTimesheet = timesheet.find((ts) => ts.monthYear === currentMonthYear);

                const shiftCount = currentMonthTimesheet?.timesheetDetails.reduce((count, d) => {
                  const workDate = new Date(d.workDate.replace(/-/g, '/').replace(/T.+/, ''));
                  if (workDate.getDate() === _day) {
                    count++;
                  }
                  return count;
                }, 0);

                return <Td className="h-[120px]">
                  <div className="flex absolute top-0.5 right-0.5">
                    <div class={`m-3 flex h-6 w-6 mx-auto my-auto items-center justify-center ${isToday(_day, currentMonth, currentYear) && "rounded-full bg-orange-500 font-semibold text-white"}`}>
                      <p>{_day}</p>
                    </div>
                  </div>
                  <div className="flex flex-row overflow-y-auto gap-1 absolute inset-x-0 bottom-0 px-1 h-[90px]">
                    {timesheet &&
                      currentMonthTimesheet?.timesheetDetails.map((d) => {
                        const workDate = new Date(d.workDate.replace(/-/g, '/').replace(/T.+/, ''));
                        const date = new Date(currentYear, currentMonth, _day);
                        const members = currentMonthTimesheet.members;

                        if (d?.comment || d.proofs.length > 0) {
                          if (workDate.getDate() === date.getDate()) {
                            const borderClass = d.proofs && (d.proofs.filter((proof) => !proof.isApproved).length > 0 || d.proofs.length === 0)
                              ? "border-orange-300"
                              : "border-green-300";

                            return (
                              <div className={`relative`} style={{width: `${1/(shiftCount <= 2 ? 2 : 3) * 100}%`}}>
                                <TimesheetViewFile timesheetDetail={d} slug={slug} workDate={workDate} members={members} isManager={isManager} isLeader={isLeader} isMember={isMember} isAdmin={isAdmin}>
                                  <button className={`w-full border-3 ${borderClass} inset-x-0 rounded-md px-1 font-semibold`}>
                                    <>
                                      {`Ca ${d.shift === 'morning' ? 'sáng' : d.shift === 'evening' ? 'chiều' : 'tối'}`}
                                      <Divider className="border-[#334155]" />
                                      {d?.comment && (
                                        <div className="flex items-center gap-1">
                                          <MdOutlineNotes />
                                          <div className="truncate w-full text-left">{d.comment}</div>
                                        </div>
                                      )}
                                      {d.proofs.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <MdOutlineInsertDriveFile />
                                          <div className="truncate w-full text-left">tệp: {d.proofs.length}</div>
                                        </div>
                                      )}
                                    </>
                                  </button>
                                </TimesheetViewFile>
                              </div>
                            );
                          }
                        }
                      })}
                  </div>
                </Td>
              }
              if (7 * week + day >= endOfCurrentMonth.getDate() + mondayOffset) {
                return <Td className="text-black text-opacity-50 h-[110px]">
                  <div className="flex absolute top-0.5 right-0.5">
                    <div class={`m-3 flex h-6 w-6 mx-auto my-auto items-center justify-center`}>
                      {/* <p>{7 * week + day - mondayOffset + 1 - endOfCurrentMonth.getDate()}</p> */}
                    </div>
                  </div>
                </Td>
              }
            })}
          </Tr>
        })
      }
    </Table >
  </>

};
export default TimesheetPanel;
