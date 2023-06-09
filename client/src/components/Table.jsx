/* eslint-disable react/no-unstable-nested-components */
import { Box, Button, Flex, Icon, Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, IconButton, Badge, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineChevronDown, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineChevronUp, } from "react-icons/hi";
import { AiFillSetting, AiFillTool } from "react-icons/ai";
import AddMaterial from "./modals/AddMaterial";
import AddLocation from "./modals/AddLocation";
import EditLocation from "./modals/EditLocation";
import ValueBox from "./misc/ValueBox";
import { addSummary, getProject } from "../features/project/projectSlice";

import { useDispatch } from "react-redux";

import { FaExpandArrowsAlt, FaCompressArrowsAlt, FaFileExport, FaSave, FaUpload, FaDownload, FaToolbox, FaHammer } from "react-icons/fa";
import { RxCheck } from "react-icons/rx"
import ExportWordModal from "./modals/ExportWordModal";

import { HiWrenchScrewdriver } from 'react-icons/hi2';
import { axios_instance } from "../utils/axios";
import { useCallback } from "react";
import { useRef } from "react";
import ExcelFileUpload from "./modals/ExcelFileUpload";
import { showToast } from "../utils/toast";

const matTextList = ["dayDans", "trus", "mongs", "das", "xaSus", "boChangs", "tiepDias", "phuKiens", "thietBis",];
const matNameList = ["Dây dẫn", "Trụ", "Móng", "Đà", "Xà sứ", "Bộ chằng", "Tiếp địa", "Phụ kiện", "Thiết bị",];


function deepCopy(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  let copy = Array.isArray(obj) ? [] : {};

  Object.keys(obj).forEach((key) => {
    copy[key] = deepCopy(obj[key]);
  });

  return copy;
}

function LockDone(_data) {
  let data = { ..._data };
  data.routes.map((route) => {
    route.stations.map((station) => {
      station.pillars.map((pillar) => {
        matTextList.map((matText) => {
          if (pillar[matText] != undefined) {
            pillar[matText].map((mat) => {
              if (mat.detail !== null)// && mat.quantity > 0)
                mat.locked = mat.isDone;
            });
          }
        });
      });
    });
  });

  return data;
}

function InitData(data) {
  data?.routes.map((route) => {
    route.stations.map((station) => {
      station.pillars.map((pillar) => {
        matTextList.map((matText) => {
          if (pillar[matText])
            pillar[matText].map((mat) => {
              if (mat?.detail !== null) {
                if (mat.isRecalled === true) {
                  mat.detail._id = `${mat.detail._id}_isRecalled`
                } else if (mat.isReassembled === true) {
                  mat.detail._id = `${mat.detail._id}_isReassembled`
                }
              }
            })
        })
      })
    })
  })
  return data
}

function InitMat(data) {
  let matList = { dayDans: [], trus: [], mongs: [], das: [], xaSus: [], boChangs: [], tiepDias: [], phuKiens: [], thietBis: [], };
  data.routes.map((route) => {
    route.stations.map((station) => {
      station.pillars.map((pillar) => {
        matTextList.map((matText) => {
          if (pillar[matText] !== undefined) {
            pillar[matText].map((mat) => {
              if (mat.detail !== null)// && mat.quantity > 0)
                if (!matList[matText].includes(mat.detail._id))
                  matList[matText].push(mat.detail._id);
            });
          }
        });
      });
    });
  });
  return matList;
}

function findParent(nestedObject, _id, memo = {}) {
  if (memo[_id]) {
    return memo[_id];
  }

  for (let key in nestedObject) {
    if (nestedObject.hasOwnProperty(key)) {
      const value = nestedObject[key];
      if (value?._id === _id) {
        memo[_id] = value;
        return value;
      } else if (typeof value === 'object') {
        const result = findParent(value, _id, memo);
        if (result) {
          memo[_id] = result;
          return result;
        }
      }
    }
  }
  memo[_id] = null;
  return null;
}

function Table({ _orig, _data, slug, allMaterials }) {
  const dispatch = useDispatch();
  const [exportMode, setExportMode] = useState(false);
  const [temp, setTemp] = useState(false);

  const orig = InitData(deepCopy(_orig))
  const [data, setData] = useState(() => {
    let data = deepCopy(_data);
    InitData(data);
    LockDone(data);
    return data;
  });

  const [materials, setMaterials] = useState(() => InitMat(data));

  const [headingToggles, setHeadingToggles] = useState(() => {
    let arr = {};
    matTextList.map((matText) => {
      arr[`toggle${matText}`] = true;
    });
    return arr;
  });

  const [editing, setEditing] = useState(data.isOriginal);
  function setState(func) {
    setTemp(!temp);
    func;
  }

  const matListMap = { ...allMaterials };

  function preparePost(_data) {
    let data = { ..._data }
    data.routes.forEach((route) => {
      if (route.isNew) delete route._id
      route.stations.forEach((station) => {
        if (station.isNew) delete station._id
        station.pillars.forEach((pillar) => {
          if (pillar.isNew) delete pillar._id
          matTextList.forEach((matText) => {
            materials[matText].forEach((mat) => {
              const [matID, matStat] = mat.split('_');
              if (!pillar[matText])
                pillar[matText] = []
              if (pillar[matText]?.length === 0) {
                pillar[matText].push({
                  detail: {
                    _id: matID,
                  },
                  quantity: null,
                  isRecalled: matStat === 'isRecalled',
                  isReassembled: matStat === 'isReassembled',
                });
              } else {
                let matDetail = pillar[matText].find((_mat) => _mat.detail._id === mat);
                if (matDetail) {
                  matDetail.detail._id = matID;
                  matDetail.isRecalled = matStat === 'isRecalled';
                  matDetail.isReassembled = matStat === 'isReassembled';
                } else {
                  pillar[matText].push({
                    detail: {
                      _id: matID,
                    },
                    quantity: null,
                    isRecalled: matStat === 'isRecalled',
                    isReassembled: matStat === 'isReassembled',
                  });
                }
              }
            });
          });
        });
      });
    });
    return data;
  }

  useEffect(() => {
    let data = LockDone(InitData(deepCopy(_data)));
    setData(data);
    setMaterials(InitMat(data));
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }, [_data]);

  const RotatedTh = React.memo(({ className, children }) => {
    return <Box as="th" className={`vertical ${className ?? ""}`}><span className="vertical">{children}</span> </Box>;
  });

  const RotatedParentTh = React.memo(({ matText, matList, _data, children }) => {
    const disableBottomButtonRef = useRef(false);

    function handleAddedMaterial(addedMaterial) {
      const updatedRoutes = [...data.routes];
      const materialsSet = new Set(addedMaterial);

      updatedRoutes.forEach((route) => {
        route.stations.forEach((station) => {
          station.pillars.forEach((pillar) => {
            if (pillar[matText] !== undefined) {
              if (addedMaterial.length === 0) {
                delete pillar[matText];
              } else {
                const newMats = pillar[matText].filter((mat) => materialsSet.has(mat.detail._id));
                pillar[matText] = newMats;
              }
            }
          });
        });
      });
      setMaterials((prevMaterials) => ({
        ...prevMaterials,
        [matText]: addedMaterial,
      }));
    }

    return (
      <>
        <Box
          as="th"
          className={`vertical primary text-white cursor-pointer`}
          onClick={() => {
            if (!disableBottomButtonRef.current) {
              setHeadingToggles((prevToggles) => ({
                ...prevToggles,
                [`toggle${matText}`]: !prevToggles[`toggle${matText}`],
              }));
            }
          }}
        >
          <div className="flex flex-col h-h justify-between">
            <div className="flex flex-col-reverse items-center">
              {editing && (
                <AddMaterial
                  // matList={matList}
                  currentMatList={_data}
                  onAddedMaterial={handleAddedMaterial}
                  matType={matText}
                >
                  <IconButton
                    size="sm"
                    onMouseOver={() => disableBottomButtonRef.current = true}
                    onMouseLeave={() => disableBottomButtonRef.current = false}
                    background="#dddddd33"
                    color="white"
                    icon={<AiFillSetting />}
                  />
                </AddMaterial>
              )}
              <Icon
                className="mt-2.5 mb-2.5"
                as={
                  headingToggles[`toggle${matText}`]
                    ? HiOutlineChevronLeft
                    : HiOutlineChevronRight
                }
                fontSize="1rem"
              />
            </div>
            <span className="vertical mx-auto">{children}</span>
          </div>
        </Box>
        {headingToggles[`toggle${matText}`] && (
          <>
            {_data.map((mat) => {
              const [matId, matSuffix] = mat.split('_');
              const material = matList.find((m) => m._id === matId);
              let name = material?.name;
              if (matSuffix === 'isRecalled')
                name += " (thu hồi)"
              else if (matSuffix === 'isReassembled')
                name += " (lắp lại)"
              return <Th key={mat}>{name}</Th>;
            })}
          </>
        )}
      </>
    );
  });

  const renderRotatedParentTh = (key, matText, matList, data) => {
    return (
      <RotatedParentTh key={key} matText={matText} matList={matList} _data={data}>
        {matNameList[key]}
      </RotatedParentTh>
    );
  };

  const PillarTr = React.memo(({ station }) => {
    const handlePillarClick = useCallback((pillar) => {
      if (!editing) {
        matTextList.forEach((matText) => {
          pillar[matText].forEach((mat) => {
            if (exportMode && mat.locked && mat.isDone)
              mat.export = !mat.export;
            else if (!exportMode && !mat.locked && mat.quantity > 0)
              mat.isDone = !mat.isDone;
          })
        })
        setState();
      }
    }, [editing, matTextList, station, exportMode]);

    return station.pillars.map((pillar, pillarIndex) => {
      return (
        <tr>
          <td className="bg-white">
            <Flex className="flex align-right">
              <div
                className="bg-[#c8ccd1] flex-1 -mt-[1px] -mb-[1px] -mr-[1px] text-black p-2 text-center cursor-pointer"
                onClick={() => handlePillarClick(pillar)}
              >
                {pillar.name}
              </div>
            </Flex>
          </td>
          <td>
            <ValueBox
              canEdit={editing}
              value={pillar.distance}
              onValueChange={(newValue) =>
                setState((pillar.distance = newValue))
              }
            />
          </td>
          <td>
            <ValueBox
              canEdit={editing}
              value={pillar.middleLine}
              onValueChange={(newValue) =>
                setState((pillar.middleLine = newValue))
              }
            />
          </td>
          <td>
            <ValueBox
              canEdit={editing}
              value={pillar.lowLine}
              onValueChange={(newValue) =>
                setState((pillar.lowLine = newValue))
              }
            />
          </td>
          {matTextList.map((matText) => {
            return <ValueTd matText={matText} pillarMaterials={pillar} />;
          })}
        </tr >
      );
    })
  })

  const SumDoneTr = React.memo(({ station }) => {
    const sumArr = { distance: 0, middleLine: 0, lowLine: 0, };

    station.pillars.forEach((pillar) => {
      sumArr.distance += pillar?.distance || 0;
      sumArr.middleLine += pillar?.middleLine || 0;
      sumArr.lowLine += pillar?.lowLine || 0;

      matTextList.forEach((matText) => {
        if (sumArr[matText] === undefined) sumArr[matText] = {};
        if (pillar[matText] !== undefined) {
          pillar[matText].forEach((mat) => {
            if (mat.detail !== null) {
              if (sumArr[matText][mat.detail._id] === undefined) {
                sumArr[matText][mat.detail._id] = {
                  sum: mat.quantity,
                  done: mat.quantity * mat.isDone
                }
              } else {
                sumArr[matText][mat.detail._id].sum += mat.quantity;
                sumArr[matText][mat.detail._id].done += mat.quantity * mat.isDone;
              }
            }
          });
        }
      });
    });

    const SumVB = [], DoneVB = [];

    matTextList.map((matText) => {
      SumVB.push(<td className="bg-white" />);
      DoneVB.push(<td className="bg-white" />);
      headingToggles[`toggle${matText}`] &&
        materials[matText].map((mat) => {
          const sumValue = sumArr[matText]?.[mat]?.sum || 0;
          const doneValue = sumArr[matText]?.[mat]?.done || 0;
          SumVB.push(
            <td key={`${matText}-${mat}`} className={"bg-[#ffcb8b]"}>
              <ValueBox canEdit={false} value={sumValue} />
            </td>
          )
          DoneVB.push(
            <td key={`${matText}-${mat}`} className={"bg-[#6dcacf]"}>
              <ValueBox canEdit={false} value={doneValue} />
            </td>
          );
        })
    })

    return <>
      <tr>
        <td className={`bg-[#ffcb8b] font-bold text-black p-2 text-center`}>Tổng cộng</td>
        <td className={"bg-[#ffcb8b]"}><ValueBox canEdit={false} value={sumArr.distance} /></td>
        <td className={"bg-[#ffcb8b]"}><ValueBox canEdit={false} value={sumArr.middleLine} /></td>
        <td className={"bg-[#ffcb8b]"}><ValueBox canEdit={false} value={sumArr.lowLine} /></td>
        {SumVB}
      </tr>
      <tr className="bg-[#6dcacf]">
        <td className={`font-bold text-black p-2 text-center`}>Đã xong</td>
        <td /><td /><td />
        {DoneVB}
      </tr>
    </>
  });

  const ValueTd = React.memo(({ matText, pillarMaterials, canEdit = true }) => {
    const materialIDs = materials[matText];
    const mats = pillarMaterials[matText];

    const handleValueChange = useCallback(
      (matID, newValue) => {
        pillarMaterials[matText] = [];
        setState(
          pillarMaterials[matText].push({
            detail: {
              _id: matID,
            },
            quantity: newValue,
            comment: "",
          })
        );
      },
      [matText, pillarMaterials, setState]
    );

    const handleValueAndCommentSubmit = useCallback(
      (matID, { quantity, comment }) => {
        pillarMaterials[matText] = [];
        setState(
          pillarMaterials[matText].push({
            detail: {
              _id: matID,
            },
            quantity: quantity,
            comment: comment,
          })
        );
      },
      [matText, pillarMaterials]
    );

    const handleClick = useCallback(
      (matchedMat) => {
        if (!matchedMat.locked && !editing && !exportMode && matchedMat.quantity !== null) {
          matchedMat.isDone = !matchedMat.isDone;
          setState();
        }

        if (exportMode && matchedMat.locked && matchedMat.isDone) {
          matchedMat.export = !matchedMat.export;
          setState();
        }
      },
      [editing, exportMode]
    );

    return (
      <>
        <td className="bg-white"></td>
        {headingToggles[`toggle${matText}`] &&
          materialIDs.map((matID) => {
            if (!mats) {
              // No any material in category
              return (
                <td key={matID}>
                  <ValueBox
                    comment={""}
                    needComment={!data.isOriginal}
                    canEdit={editing}
                    value={""}
                    onValueChange={(newValue) => handleValueChange(matID, newValue)}
                    onValueAndCommentSubmit={({ quantity, comment }) =>
                      handleValueAndCommentSubmit(matID, { quantity, comment })
                    }
                  />
                </td>
              );
            }

            const matchedMat = mats.find((mat) => mat.detail !== null && matID === mat.detail._id);
            if (matchedMat) {
              // Have quantity
              return (
                <td
                  key={matID}
                  style={{ position: "relative" }}
                  className={matchedMat.isDone && (matchedMat.locked ? "bg-[#4BE383]/75" : "bg-orange-300")}
                  onClick={() => handleClick(matchedMat)}
                >
                  <ValueBox
                    origValue={matchedMat.comment !== "" && findParent(orig.routes, matchedMat._id)}
                    comment={matchedMat.comment}
                    needComment={!data.isOriginal}
                    canEdit={editing}
                    value={matchedMat.quantity}
                    onValueChange={(newValue) => {
                      matchedMat.quantity = newValue;
                      setState();
                    }}
                    onValueAndCommentSubmit={({ quantity, comment }) => {
                      matchedMat.quantity = quantity;
                      matchedMat.comment = comment;
                      setState();
                    }}
                  />
                  {matchedMat.comment !== "" && matchedMat.comment !== null && (
                    <Badge
                      bgColor="orange.300"
                      borderRadius="full"
                      size="sm"
                      position="absolute"
                      top="-3px"
                      right="-3px"
                      w="8px"
                      h="8px"
                    ></Badge>
                  )}

                  {exportMode && matchedMat.export && (
                    <Badge
                      bgColor="transparent"
                      borderRadius="full"
                      size="sm"
                      position="absolute"
                      top="-4px"
                      left="-8px"
                      w="8px"
                      h="8px"
                    >
                      <RxCheck color="#4a5567" size={20} />
                    </Badge>
                  )}
                </td>
              );
            }

            // No material
            return (
              <td key={matID}>
                <ValueBox
                  comment={""}
                  needComment={!data.isOriginal}
                  canEdit={editing && canEdit}
                  value={""}
                  onValueChange={(newValue) => handleValueChange(matID, newValue)}
                  onValueAndCommentSubmit={({ quantity, comment }) =>
                    handleValueAndCommentSubmit(matID, { quantity, comment })
                  }
                />
              </td>
            );
          })}
      </>
    );
  });


  const Th = React.memo(({ children }) => {
    return (
      <Box as="th" className="align-bottom" bg={"#EDF2F666"}>
        <span className="rotate">{children}</span>
      </Box>
    );
  });

  {
    /* MODAL STUFFS */
  }

  const timestamp = new Date(data.updatedAt);
  const formattedTimestamp = timestamp.toLocaleString("vi-VN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  function ExcelExport() {
    axios_instance
      .post(`/projects/${slug}/summary/download`, {}, {
        responseType: "arraybuffer",
      })
      .then(function (response) {
        const url = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(url, `TongKe.xlsx`);
        showToast('success', "Tổng kê đã được tải xuống!")
      })
      .catch(function (error) {
        showToast('error', "Lỗi khi tải tổng kê!")
        console.log(error);
      });
  }

  const [saveDisabled, setSaveDisabled] = useState(false)

  const TopBar = React.memo(({ editing, exportMode, formattedTimestamp }) => {
    return <Flex className="flex justify-end items-center z-50 gap-3 mb-3 -mt-14">
      <div className="text-xs text-right mt-1">
        {editing
          ? "(chế độ chỉnh sửa)"
          : exportMode ? "(chế độ xuất biên bản)" : `Cập nhật lần cuối vào ${formattedTimestamp}.`}
      </div>
      {!exportMode ?
        <div className="flex gap-2">
          {editing && data.isOriginal === false && (
            <Popover placement="left">
              {({ isOpen, onClose }) => (
                <>
                  <PopoverTrigger>
                    <Button>Hủy</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto">
                    <PopoverArrow />
                    <PopoverBody>
                      <Flex className="flex items-center gap-2">
                        Bạn có chắc chắn chưa?
                        <Button
                          colorScheme="red"
                          onClick={async () => {
                            await dispatch(getProject(slug));
                            editing && setEditing(false);
                            onClose();
                          }}
                        >
                          Hủy
                        </Button>
                      </Flex>
                    </PopoverBody>
                  </PopoverContent>
                </>
              )}
            </Popover>
          )}
          {!editing &&
            <Menu>
              <MenuButton as={Button} rightIcon={<HiOutlineChevronDown />}>
                Tùy chọn
              </MenuButton>
              <div className="z-10">
                <MenuList>
                  <MenuItem icon={<FaFileExport />} onClick={() => setExportMode(true)}>Xuất biên bản</MenuItem>
                  <MenuItem icon={<FaDownload />} onClick={() => ExcelExport()}>Tải xuống Excel</MenuItem>
                  <ExcelFileUpload slug={slug} isOriginal={data.isOriginal}><MenuItem icon={<FaUpload />}>Tải lên Excel</MenuItem></ExcelFileUpload>
                  <MenuItem icon={<HiWrenchScrewdriver />} onClick={() => setEditing(true)}>Chỉnh sửa</MenuItem>
                </MenuList>
              </div>
            </Menu>
          }
          <Popover placement="left">
            {({ isOpen, onClose }) => (
              <>
                <PopoverTrigger>
                  <Button colorScheme="red" color={"#FFFFFF"} leftIcon={<FaSave />} isDisabled={saveDisabled}>
                    {"Lưu"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                  <PopoverArrow />
                  <PopoverBody>
                    <Flex className="flex items-center gap-2">
                      Bạn có chắc chắn chưa?
                      <Button
                        colorScheme="red"
                        isDisabled={saveDisabled}
                        onClick={async () => {
                          setSaveDisabled(true)
                          let _data = preparePost(deepCopy(data));
                          await dispatch(addSummary({ _data, slug }));
                          if (editing) setEditing(false);
                          setSaveDisabled(false)
                          onClose();
                        }}
                      >
                        OK
                      </Button>
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
        </div>
        : <div>
          <Popover placement="left">
            {({ isOpen, onClose }) => (
              <>
                <PopoverTrigger>
                  <Button>Thoát</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                  <PopoverArrow />
                  <PopoverBody>
                    <Flex className="flex items-center gap-2">
                      Bạn có chắc chắn chưa?
                      <Button
                        colorScheme="red"
                        onClick={async () => {
                          await dispatch(getProject(slug));
                          setExportMode(false)
                          onClose();
                        }}
                      >
                        Thoát
                      </Button>
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
          <ExportWordModal data={data} preparePost={preparePost}>
            <Button className="ml-2" background={"#FF645B"} color={"#FFFFFF"} leftIcon={<FaFileExport />}>
              {"Xuất biên bản"}
            </Button>
          </ExportWordModal>
        </div>
      }
    </Flex>
  });

  const [selectedRoute, setSelectedRoute] = useState(undefined)
  const [selectedStation, setSelectedStation] = useState(undefined)

  const handleAddedLocation = useCallback(
    (addedLocation, routeId = undefined, stationId = undefined) => {
      const newData = { ...data };
      const addedLocations = addedLocation.split("\n").filter(Boolean);
      const routesLookup = {};
      const stationsLookup = {};

      if (!routeId && !stationId) {
        addedLocations.forEach((location) => {
          const routeId = uuidv4();
          newData.routes.push({
            name: "Tuyến: " + location.trim(),
            stations: [],
            _id: routeId,
            isNew: true
          });
          routesLookup[routeId] = newData.routes[newData.routes.length - 1];
        });
      } else if (routeId && !stationId) {
        const route = routesLookup[routeId] || newData.routes.find((r) => r._id === routeId);
        console.log(route)
        addedLocations.forEach((location) => {
          const stationId = uuidv4();
          route.stations.push({
            name: "Nhánh: " + location.trim(),
            pillars: [],
            _id: stationId,
            isNew: true
          });
          stationsLookup[stationId] = route.stations[route.stations.length - 1];
        });
      } else if (routeId && stationId) {
        const route = routesLookup[routeId] || newData.routes.find((r) => r._id === routeId);
        const station = stationsLookup[stationId] || route.stations.find((s) => s._id === stationId);
        addedLocations.forEach((location) => {
          station.pillars.push({
            name: location.trim(),
            _id: uuidv4(),
            isNew: true
          });
        });
      }
      setData(newData);
    },
    [data]
  )

  const ValueTable = (() => {
    const route = data.routes.find((route) => route._id === selectedRoute)
    const station = route ? route.stations.find((station) => station._id === selectedStation) : undefined

    return <table className="big-table">
      <tr>
        <th className="text-white primary w-48">
          <div className="w-48">
            {" "}
            <div className="absolute right-0 bottom-0 ml-2 mr-2 mb-2">
              <Flex className="flex justify-between">
                {(route && station && editing) &&
                  <AddLocation onAddedLocation={handleAddedLocation} routeId={route._id} stationId={station._id} />
                }
              </Flex>
            </div>
          </div>
          <main className="text-lg">SỐ TRỤ</main>
        </th>
        <RotatedTh className="text-white primary">Khoảng cách</RotatedTh>
        <RotatedTh className="text-white primary">Trung thế</RotatedTh>
        <RotatedTh className="text-white primary">Hạ thế</RotatedTh>

        {matTextList.map((matText, index) => {
          const matList = matListMap[matText];
          return renderRotatedParentTh(index, matText, matList, materials[matText]);
        })}

      </tr>
      {
        !(selectedStation === '' || !route) && <>
          <PillarTr station={station} />
          <SumDoneTr station={station} />
        </>
      }
    </table >
  })

  const LeftBar = React.memo(() => {
    const handleChangedLocation = useCallback(
      (changedRoute, routeId = undefined, stationId = undefined, pillarId = undefined) => {
        setData((prevData) => {
          const newData = { ...prevData };
          if (routeId && !stationId) {
            // Change route
            newData.routes.find((route) => route._id === routeId).name = `${!changedRoute.toLowerCase().startsWith('tuyến:') ? "Tuyến:" : ""} ${changedRoute}`;
          } else if (routeId && stationId && !pillarId) {
            // Change station
            newData.routes.find((route) => route._id === routeId).stations.find((station) => station._id === stationId).name = `${!changedRoute.toLowerCase().startsWith('nhánh:') ? "Nhánh:" : ""} ${changedRoute}`;
          } else if (routeId && stationId && pillarId) {
            // Change pillar
            newData.routes.find((route) => route._id === routeId).stations.find((station) => station._id === stationId).pillars.find((pillar) => pillar._id === pillarId).name = `${!changedRoute.toLowerCase().startsWith('nhánh:') ? "Nhánh:" : ""} ${changedRoute}`;
          }
          return newData;
        });
      },
      []
    );

    const handleDeletedRoute = useCallback(
      (routeId = undefined, stationId = undefined, pillarId = undefined) => {
        setData((prevData) => {
          const newData = { ...prevData };
          if (routeId && !stationId) {
            // Delete route
            newData.routes = newData.routes.filter((route) => route._id !== routeId);
          } else if (routeId && stationId) {
            const route = newData.routes.find((route) => route._id === routeId);
            if (!pillarId) {
              // Delete station
              route.stations = route.stations.filter((station) => station._id !== stationId);
            } else {
              // Delete pillar
              let pillars = route.stations.find((station) => station._id === stationId).pillars;
              pillars = pillars.filter((pillar) => pillar._id !== pillarId);
            }
          }
          return newData;
        });
      },
      []
    );

    return <nav class="mt-1 order-first overflow-y-auto"
      style={{ width: '20vw', height: '82vh' }}>
      <div className='overflow-auto flex flex-col rounded-lg mr-3 px-1.5 bg-black/[.025]'
        style={{ height: `${editing ? "77vh" : "82vh"}` }}>
        {
          data.routes.map((route) => {
            return (
              <div>
                <Box
                  className={`min-h-[45px] relative flex items-center group min-h-[30px] cursor-default mt-2 bg-[#4a5567] text-white rounded-t-lg pl-2 px-1`}
                >
                  <div className='my-auto mr-5'>{route.name}</div>
                  {editing &&
                    <div className="absolute right-0">
                      <EditLocation name={route.name} onChangedLocation={handleChangedLocation} onDeletedLocation={handleDeletedRoute} routeId={route._id} />
                      <AddLocation onAddedLocation={handleAddedLocation} routeId={route._id} />
                    </div>
                  }
                </Box>

                <div
                  className="bg-black/[.05] rounded-b-lg flex flex-col"
                >
                  {route.stations.map((station) => {
                    return <Box
                      className={`px-1 relative flex items-center hover:bg-black/[.05] ${selectedStation === station._id ? "font-bold" : ""} border-t-2 border-black/[.15] cursor-pointer`}
                    >
                      <div className="flex w-full justify-between">
                        <div className="my-auto w-full"
                          onClick={() => {
                            setSelectedRoute(route._id)
                            setSelectedStation(station._id)
                          }}>{station.name}</div>

                        {editing &&
                          <div className=""><EditLocation name={station.name} onChangedLocation={handleChangedLocation} onDeletedLocation={handleDeletedRoute} routeId={route._id} stationId={station._id} /></div>
                        }
                      </div>
                    </Box>
                  })}
                </div>
              </div>
            )
          })
        }
      </div >
      {editing &&
        <div className="w-full mt-2 mx-auto flex items-center justify-center">
          <AddLocation onAddedLocation={handleAddedLocation} />
        </div>
      }
    </nav >
  });

  return (
    <>
      <TopBar editing={editing} exportMode={exportMode} formattedTimestamp={formattedTimestamp} />
      <div class="flex-1 flex flex-row overflow-y-hidden">
        <LeftBar />
        <Flex className='mt-1 flex flex-col gap-3' style={{ width: '78vw', height: '82vh' }}>
          <main class="overflow-y-auto flex-1 rounded-lg">
            <div className='rounded-lg'>
              <ValueTable />
            </div>
          </main>
        </Flex>
      </div >
    </>
  )
}

export default Table;
