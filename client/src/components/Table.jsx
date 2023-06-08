/* eslint-disable react/no-unstable-nested-components */
import { Box, Button, Flex, Icon, Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, IconButton, Badge, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import React, { useEffect, useMemo, useState } from "react";
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
import AddNewMaterial from "./modals/AddNewMaterial";

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
  const [routeToggles, setRouteToggles] = useState(() => {
    let _routeToggles = {};
    data.routes.map((route, routeIndex) => {
      _routeToggles[`toggle${routeIndex}`] = false;
    });
    return _routeToggles;
  });
  const [stationToggles, setStationToggles] = useState(() => {
    let _stationToggles = {};
    data.routes.map((route, routeIndex) => {
      route.stations.map((station, stationIndex) => {
        _stationToggles[`toggle${routeIndex}-${stationIndex}`] = false;
      });
    });
    return _stationToggles;
  });

  const [editing, setEditing] = useState(data.isOriginal);
  function setState(func) {
    setTemp(!temp);
    func;
  }

  const { DayDan: dayDanList, Tru: truList, Mong: mongList, Da: daList, XaSu: xaSuList, BoChang: boChangList, TiepDia: tiepDiaList, PhuKien: phuKienList, ThietBi: thietBiList } = allMaterials;
  const matListMap = { dayDans: dayDanList, trus: truList, mongs: mongList, das: daList, xaSus: xaSuList, boChangs: boChangList, tiepDias: tiepDiaList, phuKiens: phuKienList, thietBis: thietBiList };

  function preparePost(data) {
    data.routes.forEach((route) => {
      route.stations.forEach((station) => {
        station.pillars.forEach((pillar) => {
          matTextList.forEach((matText) => {
            materials[matText].forEach((mat) => {
              console.log(pillar[matText]);
              const [matID, matStat] = mat.split('_');
              if (pillar[matText].length === 0) {
                pillar[matText].push({
                  detail: {
                    _id: matID,
                  },
                  quantity: null,
                  isRecalled: matStat === 'isRecalled',
                  isReassembled: matStat === 'isReassembled',
                });
              } else {
                let matDetail = pillar[matText].find((_mat) => _mat.detail._id == matID);
                if (matDetail) {
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
          className={`vertical primary text-white`}
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
                  matList={matList}
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


  const handleAddedLocation = useCallback((addedLocation, type, parentIndex, index) => {
    let newData = { ...data };

    switch (type) {
      case "route": {
        let toggleLength = Object.keys(routeToggles).length;
        let toggle = { ...routeToggles };
        let addedLocations = addedLocation.split("\n").filter(Boolean);

        addedLocations.forEach((location) => {
          newData.routes.push({ name: "Tuyến: " + location.trim(), stations: [] });
          toggle[`toggle${toggleLength}`] = true;
          toggleLength++;
        });

        setRouteToggles(toggle);
        break;
      }
      case "station": {
        let toggleLength = 0;
        let toggle = { ...stationToggles };
        for (const key in stationToggles) {
          if (key.startsWith(`toggle${index}`)) {
            toggleLength++;
          }
        }
        let addedLocations = addedLocation.split("\n").filter(Boolean);

        addedLocations.forEach((location) => {
          newData.routes[index].stations.push({
            name: "Nhánh: " + location.trim(),
            pillars: [],
          });
          toggle[`toggle${index}-${toggleLength}`] = true;
          toggleLength++;
        });

        setStationToggles(toggle);
        break;
      }
      case "pillar": {
        let addedLocations = addedLocation.split("\n").filter(Boolean);

        addedLocations.forEach((location) => {
          newData.routes[parentIndex].stations[index].pillars.push({
            name: location.trim(),
          });
        });
        break;
      }
      default:
        break;
    }
    setData(newData);
  }, []);

  const RouteTr = React.memo(({ index, children }) => {
    const disableBottomButtonRef = useRef(false);
    const [showAddMaterial, setShowAddMaterial] = useState(false);

    function handleChangedRoute(changedRoute) {
      let newData = { ...data };
      newData.routes[index].name = `${!changedRoute.toLowerCase().startsWith('tuyến:') ? "Tuyến:" : ""} ${changedRoute}`;
      setData(newData);
    }

    function handleDeletedRoute() {
      let newData = { ...data };
      newData.routes.splice(index, 1);
      setData(newData);
    }

    return (
      <>
        <Box
          className={"text-white text-center"}
          as={"tr"}
          onClick={() => {
            if (!disableBottomButtonRef.current)
              setRouteToggles({
                ...routeToggles,
                [`toggle${index}`]: !routeToggles[`toggle${index}`],
              });
          }}
        >
          <td className="primary">
            <Box
              className="flex justify-between items-center p-2"
              onContextMenu={() => editing && setShowAddMaterial(true)}
            >
              <div className="mx-auto">{children}</div>
              <div className="flex items-center">
                <Icon
                  className="ml-2.5 mr-2.5"
                  as={
                    routeToggles[`toggle${index}`]
                      ? HiOutlineChevronUp
                      : HiOutlineChevronDown
                  }
                ></Icon>
                {editing && (
                  <AddLocation
                    type={"station"}
                    onAddedLocation={handleAddedLocation}
                    disableBottomButtonRef={disableBottomButtonRef}
                    index={index}
                  />
                )}
                <EditLocation
                  isOpen={showAddMaterial}
                  type={"route"}
                  name={children}
                  disableBottomButtonRef={disableBottomButtonRef}
                  onChangedLocation={handleChangedRoute}
                  onDeletedLocation={handleDeletedRoute}
                  onClose={() => setShowAddMaterial(false)}
                />
              </div>
            </Box>
          </td>
        </Box>
        {routeToggles[`toggle${index}`] && (
          <>
            {data.routes[index].stations.map((station, stationIndex) => {
              return <StationTr parentIndex={index} index={stationIndex}>{station.name}</StationTr>;
            })}
            <SumDoneTr index={index} />
          </>
        )}
      </>
    );
  });

  const StationTr = React.memo(({ parentIndex, index, children }) => {
    const disableBottomButtonRef = useRef(false);
    const [showAddMaterial, setShowAddMaterial] = useState(false);

    function handleChangedStation(changedStation) {
      let newData = { ...data };
      newData.routes[parentIndex].stations[index].name = `${!changedStation.toLowerCase().startsWith('nhánh:') ? "Nhánh:" : ""} ${changedStation}`;
      setData(newData);
    }

    function handleDeletedStation() {
      let newData = { ...data };
      newData.routes[parentIndex].stations.splice(index, 1);
      setData(newData);
    }

    return (
      <>
        <Box
          className={"text-white text-center"}
          as={"tr"}
          onClick={() => {
            if (!disableBottomButtonRef.current)
              setStationToggles({
                ...stationToggles,
                [`toggle${parentIndex}-${index}`]:
                  !stationToggles[`toggle${parentIndex}-${index}`],
              });
          }}
        >
          <td className="bg-white">
            <Box
              className="flex bg-[#7c8592] -mt-[1px] -mb-[1px] -mr-[1px] ml-5 justify-between items-center p-2"
              onContextMenu={() => editing && setShowAddMaterial(true)}
            >
              <div className="mx-auto">{children}</div>
              <div className="flex items-center">
                <Icon
                  className="ml-2.5 mr-2.5"
                  as={
                    stationToggles[`toggle${parentIndex}-${index}`]
                      ? HiOutlineChevronUp
                      : HiOutlineChevronDown
                  }
                ></Icon>
                {editing && (
                  <AddLocation
                    type={"pillar"}
                    onAddedLocation={handleAddedLocation}
                    disableBottomButtonRef={disableBottomButtonRef}
                    parentIndex={parentIndex}
                    index={index}
                  ></AddLocation>
                )}
                <EditLocation
                  isOpen={showAddMaterial}
                  type={"station"}
                  name={children}
                  onChangedLocation={handleChangedStation}
                  disableBottomButtonRef={disableBottomButtonRef}
                  onDeletedLocation={handleDeletedStation}
                  onClose={() => setShowAddMaterial(false)}
                />
              </div>
            </Box>
          </td>
        </Box>
        {stationToggles[`toggle${parentIndex}-${index}`] &&
          <PillarTr parentIndex={parentIndex} index={index} />
        }
      </>
    );
  });

  const PillarTr = React.memo(({ parentIndex, index }) => {
    return data.routes[parentIndex].stations[index].pillars.map((pillar, pillarIndex) => {
      const [_showAddMaterial, _setShowAddMaterial] = useState(false);
      const handleChangedPillar = useCallback((changedPillar) => {
        let newData = { ...data };
        newData.routes[parentIndex].stations[index].pillars[pillarIndex].name = changedPillar;
        setData(newData);
      }, [data, parentIndex, index, pillarIndex]);

      const handleDeletedPillar = useCallback(() => {
        let newData = { ...data };
        newData.routes[parentIndex].stations[index].pillars.splice(pillarIndex, 1);
        setData(newData);
      }, [data, parentIndex, index, pillarIndex]);

      return (
        <>
          <tr>
            <td className="bg-white">
              <Flex className="flex align-right">
                <div
                  className="bg-[#c8ccd1] flex-1 -mt-[1px] -mb-[1px] -mr-[1px] ml-10 text-black p-2 text-center"
                  onClick={() => {
                    if (!editing) {
                      matTextList.map((matText) => {
                        pillar[matText].map((mat) => {
                          if (exportMode && mat.locked && mat.isDone)
                            setState(mat.export = !mat.export);
                          else if (!exportMode && !mat.locked)
                            mat.isDone = !mat.isDone;

                        })
                      })
                      setState();
                    }
                  }}
                  onContextMenu={() =>
                    editing && _setShowAddMaterial(true)
                  }
                >
                  {pillar.name}
                </div>
                <EditLocation
                  isOpen={_showAddMaterial}
                  type={"pillar"}
                  name={pillar.name}
                  onChangedLocation={handleChangedPillar}
                  onDeletedLocation={handleDeletedPillar}
                  onClose={() => _setShowAddMaterial(false)}
                />
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
          </tr>
        </>
      );
    })
  })

  const SumDoneTr = React.memo(({ index }) => {
    const sumArr = { distance: 0, middleLine: 0, lowLine: 0, };

    data.routes[index].stations.forEach((station) => {
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
      <tr>
        <td className={`bg-[#6dcacf] font-bold text-black p-2 text-center`}>Đã xong</td>
        <td /><td /><td />
        {DoneVB}
      </tr>
    </>
  });

  const ValueTd = React.memo(({ matText, pillarMaterials, canEdit = true }) => {
    const materialIDs = materials[matText];
    const mats = pillarMaterials[matText];

    const handleValueChange = useCallback(
      (matchedMat, newValue) => {
        matchedMat.quantity = newValue;
      },
      []
    );

    const handleValueAndCommentSubmit = useCallback(
      (matchedMat, quantity, comment) => {
        matchedMat.quantity = quantity;
        matchedMat.comment = comment;
      },
      []
    );

    return (
      <>
        <td className="bg-white"></td>
        {headingToggles[`toggle${matText}`] &&
          materialIDs.map((matID) => {
            if (!mats) {
              return (
                <td key={matID}>
                  <ValueBox
                    comment={""}
                    needComment={!data.isOriginal}
                    canEdit={editing}
                    value={""}
                    onValueChange={(newValue) => {
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
                    }}
                    onValueAndCommentSubmit={({ quantity, comment }) => {
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
                    }}
                  />
                </td>
              );
            }

            let value = undefined;
            const matchedMat = mats.find((mat) => mat.detail !== null && matID === mat.detail._id);
            if (matchedMat) {
              return value = (
                <td
                  key={matID}
                  style={{ position: "relative" }}
                  className={matchedMat.isDone && (matchedMat.locked ? "bg-[#4BE383]/75" : "bg-orange-300")}
                  onClick={() => {
                    if (!matchedMat.locked && !editing && !exportMode && matchedMat.quantity !== null)
                      setState((matchedMat.isDone = !matchedMat.isDone));

                    if (exportMode && matchedMat.locked && matchedMat.isDone)
                      setState(matchedMat.export = !matchedMat.export);
                  }}
                >
                  <ValueBox
                    origValue={matchedMat.comment !== "" && findParent(orig.routes, matchedMat._id)}
                    comment={matchedMat.comment}
                    needComment={!data.isOriginal}
                    canEdit={editing}
                    value={matchedMat.quantity}
                    onValueChange={(newValue) => handleValueChange(matchedMat, newValue)}
                    onValueAndCommentSubmit={({ quantity, comment }) =>
                      handleValueAndCommentSubmit(matchedMat, quantity, comment)
                    }
                  />
                  {(matchedMat.comment !== "" && matchedMat.comment !== null) && (
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

                  {(exportMode && matchedMat.export) &&
                    <Badge
                      bgColor="transparent"
                      borderRadius="full"
                      size="sm"
                      position="absolute"
                      top="-4px"
                      left="-8px"
                      w="8px"
                      h="8px"
                    ><RxCheck color="#4a5567" size={20} /></Badge>
                  }
                </td>
              );
            }

            return <td key={matID}>
              <ValueBox
                comment={""}
                needComment={!data.isOriginal}
                canEdit={editing && canEdit}
                value={""}
                onValueChange={(newValue) => {
                  setState(
                    pillarMaterials[matText].push({
                      detail: {
                        _id: matID,
                      },
                      quantity: newValue,
                      comment: "",
                    })
                  );
                }}
                onValueAndCommentSubmit={({ quantity, comment }) => {
                  setState(
                    pillarMaterials[matText].push({
                      detail: {
                        _id: matID,
                      },
                      quantity: quantity,
                      comment: comment,
                    })
                  );
                }}
              />
            </td>;
          })}
      </>
    );
  }, (oldProp, newProp) => {

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
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const [saveDisabled, setSaveDisabled] = useState(false)


  const TopBar = React.memo(() => {
    return <Flex className="flex justify-between items-center mb-3 z-50">
      <div>
        <p className="font-bold text-md mt-2"> Tổng kê </p>
        <p className="text-xs mb-3">
          {editing
            ? "(chế độ chỉnh sửa)"
            : exportMode ? "(chế độ xuất biên bản)" : `Cập nhật lần cuối vào ${formattedTimestamp}.`}
        </p>
      </div>
      {!exportMode ?
        <div className="flex gap-2">
          {editing &&
            <AddNewMaterial>
              <Button leftIcon={<FaHammer />}>
                Thêm vật tư mới
              </Button>
            </AddNewMaterial>
          }
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
                  <Button background={"#FF645B"} color={"#FFFFFF"} leftIcon={<FaSave />} isDisabled={saveDisabled}>
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
          <ExportWordModal data={preparePost(data)}>
            <Button className="ml-2" background={"#FF645B"} color={"#FFFFFF"} leftIcon={<FaFileExport />}>
              {"Xuất biên bản"}
            </Button>
          </ExportWordModal>
        </div>}
    </Flex>
  });

  const expandAll = useCallback(() => {
    setRouteToggles(
      Object.fromEntries(
        Object.keys(routeToggles).map((key) => [
          key,
          true,
        ])
      )
    );
    setStationToggles(
      Object.fromEntries(
        Object.keys(stationToggles).map((key) => [
          key,
          true,
        ])
      )
    );
  }, [[routeToggles, setRouteToggles, stationToggles, setStationToggles]])

  const collapseAll = useCallback(() => {
    setRouteToggles(
      Object.fromEntries(
        Object.keys(routeToggles).map((key) => [
          key,
          false,
        ])
      )
    );
    setStationToggles(
      Object.fromEntries(
        Object.keys(stationToggles).map((key) => [
          key,
          false,
        ])
      )
    );
  }, [[routeToggles, setRouteToggles, stationToggles, setStationToggles]])

  return (
    <>
      <TopBar />
      <div style={{ overflowX: "auto" }} className="table-wrapper">
        {/* First Row */}

        <table className="big-table">
          <tr>
            <th className="text-white primary w-64">
              <div className="w-64">
                {" "}
                <div className="absolute inset-x-0 bottom-0 ml-2 mr-2 mb-2">
                  <Flex className="flex justify-between">
                    <div className="flex gap-1.5">
                      <IconButton
                        size="sm"
                        background="#dddddd33"
                        color="white"
                        icon={<FaExpandArrowsAlt />}
                        onClick={() => expandAll()}
                      />
                      <IconButton
                        size="sm"
                        background="#dddddd33"
                        color="white"
                        icon={<FaCompressArrowsAlt />}
                        onClick={() => collapseAll()}
                      />
                    </div>
                    {editing && (
                      <AddLocation
                        type={"route"}
                        onAddedLocation={handleAddedLocation}
                      >
                        {" "}
                      </AddLocation>
                    )}
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
              return (
                <RotatedParentTh key={index} matText={matText} matList={matList} _data={materials[matText]}>
                  {matNameList[index]}
                </RotatedParentTh>
              );
            })}
          </tr>

          {/* Row */}
          {data.routes.map((route, routeIndex) => {
            return <RouteTr key={routeIndex} index={routeIndex} _data={route}>{route.name}</RouteTr>;
          })}
        </table>
      </div>
    </>
  );
}

export default Table;
