import { Badge, Box, Button, ButtonGroup, Flex, FormControl, FormLabel, IconButton, Input, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverFooter, PopoverTrigger, Table, Td, Tooltip, Tr, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import '../../css/additional-styles/timesheet.scss'
import { FaChevronLeft, FaChevronRight, FaRegStickyNote } from 'react-icons/fa'
import { MdToday, MdEditNote, MdInsertDriveFile, MdOutlineInsertDriveFile, MdOutlineNotes } from 'react-icons/md';
import TimesheetFileUpload from "../modals/TimesheetFileUpload";
import TimesheetViewFile from "../modals/TimesheetViewFile";
import AddCommentForTimesheet from "../modals/AddCommentForTimesheet";

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

  const finalRef = React.useRef(null)

  function isToday(day, month, year) {
    return day === currentDay && month === currentDate.getMonth() && year === currentDate.getFullYear()
  }

  return <>
    <div className="flex justify-between items-center mb-3">
      <div className="flex gap-24 items-center">
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
          <p className="text-md text-sm">{`Năm ${currentYear}`}</p>
        </div>
        <IconButton icon={<FaChevronRight />} onClick={() => {
          if (currentMonth < 11)
            setCurrentMonth(currentMonth + 1)
          else {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
          }
        }}></IconButton>
        <Button
          className='-ml-20'
          leftIcon={<MdToday />}
          onClick={() => {
            setCurrentMonth(currentDate.getMonth());
            setCurrentYear(currentDate.getFullYear());
          }}
        >
          Hôm nay
        </Button>
      </div>
      <div>
        {(isManager || isLeader || isAdmin) && 
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
                return <Td className="h-[110px]">
                  <div className="flex absolute top-0.5 right-0.5">
                    <div class={`m-3 flex h-6 w-6 mx-auto my-auto items-center justify-center ${isToday(_day, currentMonth, currentYear) && "rounded-full bg-orange-500 font-semibold text-white"}`}>
                      <p>{_day}</p>
                    </div>
                  </div>
                  <div className="overflow-y-auto gap-1 flex flex-col absolute inset-x-0 bottom-0 px-1 h-[80px]">
                    {timesheet &&
                      timesheet.timesheetDetail.map((d) => {
                        const workDate = new Date(d.workDate)
                        const date = new Date(currentYear, currentMonth, _day)
                        if ((d?.comment || d.proofs.length > 0))
                          if (workDate.getFullYear() === date.getFullYear() && workDate.getMonth() === date.getMonth() && workDate.getDate() === date.getDate()) {
                            return <div className="relative">
                              <TimesheetViewFile timesheetDetail={d} slug={slug} workDate={workDate} isManager={isManager} isLeader={isLeader} isMember={isMember}>
                                <button
                                  className={`w-full border-2 ${d.proofs && (d.proofs.filter((proof) => !proof.isApproved).length > 0 || d.proofs.length === 0) ? "border-orange-300" : "border-green-300"} inset-x-0 rounded-md px-1 font-semibold`}
                                >
                                  {
                                    /* {`${workDate.getHours()}:${String(workDate.getMinutes()).padStart(2, "0")}`} */
                                    (d?.comment && d.proofs.length > 0) ?
                                      <>
                                        <div className="flex items-center gap-2" >
                                          <MdOutlineNotes />
                                          <div className="truncate w-full text-left">{d.comment}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <MdOutlineInsertDriveFile />
                                          có {d.proofs.length} tệp
                                        </div>
                                      </> :
                                      d?.comment ?
                                        <div className="flex items-center gap-2 text-ellipsis overflow-hidden" >
                                          <MdOutlineNotes />
                                          {d.comment}
                                        </div> :
                                        d.proofs.length > 0 &&
                                        <div className="flex items-center gap-2">
                                          <MdOutlineInsertDriveFile />
                                          có {d.proofs.length} tệp
                                        </div>
                                  }
                                </button>
                                {/* {d?.comment && <Badge
                                bgColor="orange.300"
                                borderRadius="full"
                                size="sm"
                                position="absolute"
                                left="10px"
                                w="8px"
                                h="8px"
                                top="9px"
                              ></Badge>} */}
                              </TimesheetViewFile>
                            </div>
                          }
                      })
                    }
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
    </Table>
  </>

};
export default TimesheetPanel;
