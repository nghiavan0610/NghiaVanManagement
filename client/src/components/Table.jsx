/* eslint-disable react/no-unstable-nested-components */
import {
    Box,
    Button,
    Flex,
    Icon,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    IconButton,
    Badge,
} from '@chakra-ui/react';

import React, { useEffect, useState } from 'react';
import { HiOutlineChevronDown, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineChevronUp } from 'react-icons/hi';
import { AiFillSetting } from 'react-icons/ai';
import AddMaterial from './modals/AddMaterial';
import AddLocation from './modals/AddLocation';
import EditLocation from './modals/EditLocation';
import ValueBox from './misc/ValueBox';
import { addSummary, getProject } from '../features/project/projectSlice';

import { useDispatch, useSelector } from 'react-redux';

import { FaExpandArrowsAlt, FaCompressArrowsAlt, FaFileExport, FaSave } from 'react-icons/fa';
import { RxCheck } from 'react-icons/rx';
import ExportWordModal from './modals/ExportWordModal';

import { HiWrenchScrewdriver } from 'react-icons/hi2';

function Table({ _orig, _data, slug, allMaterials }) {
    const dispatch = useDispatch();

    function deepCopy(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        let copy = Array.isArray(obj) ? [] : {};

        Object.keys(obj).forEach((key) => {
            copy[key] = deepCopy(obj[key]);
        });

        return copy;
    }

    const matTextList = ['dayDans', 'trus', 'mongs', 'das', 'xaSus', 'boChangs', 'tiepDias', 'phuKiens', 'thietBis'];
    const matNameList = ['Dây dẫn', 'Trụ', 'Móng', 'Đà', 'Xà sứ', 'Bộ chằng', 'Tiếp địa', 'Phụ kiện', 'Thiết bị'];

    function LockDone(_data) {
        let data = { ..._data };
        data.routes.map((route) => {
            route.stations.map((station) => {
                station.pillars.map((pillar) => {
                    matTextList.map((matText) => {
                        if (pillar[matText] != undefined) {
                            pillar[matText].map((mat) => {
                                if (mat.detail !== null && mat.quantity > 0) mat.locked = mat.isDone;
                            });
                        }
                    });
                });
            });
        });

        return data;
    }

    const orig = InitData(deepCopy(_orig));
    const [data, setData] = useState(() => {
        let data = deepCopy(_data);
        InitData(data);
        LockDone(data);
        return data;
    });

    function InitData(data) {
        data?.routes.map((route) => {
            route.stations.map((station) => {
                station.pillars.map((pillar) => {
                    matTextList.map((matText) => {
                        pillar[matText].map((mat) => {
                            if (mat.isRecalled === true) {
                                mat.detail._id = `${mat.detail._id}_isRecalled`;
                            }
                        });
                    });
                });
            });
        });
        return data;
    }

    function InitMat(data) {
        let matList = {
            dayDans: [],
            trus: [],
            mongs: [],
            das: [],
            xaSus: [],
            boChangs: [],
            tiepDias: [],
            phuKiens: [],
            thietBis: [],
        };

        data.routes.map((route) => {
            route.stations.map((station) => {
                station.pillars.map((pillar) => {
                    matTextList.map((matText) => {
                        if (pillar[matText] !== undefined) {
                            pillar[matText].map((mat) => {
                                if (mat.detail !== null && mat.quantity > 0)
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

    function preparePost(data) {
        data.routes.map((route) => {
            route.stations.map((station) => {
                station.pillars.map((pillar) => {
                    matTextList.map((matText) => {
                        if (pillar[matText])
                            pillar[matText].map((mat) => {
                                if (mat.detail !== null && mat.detail._id.split('_')[1]) {
                                    mat.detail._id = mat.detail._id.split('_')[0];
                                    mat.isRecalled = true;
                                }
                            });
                    });
                });
            });
        });
        return data;
    }

    const [materials, setMaterials] = useState(() => InitMat(data));

    const {
        DayDan: dayDanList,
        Tru: truList,
        Mong: mongList,
        Da: daList,
        XaSu: xaSuList,
        BoChang: boChangList,
        TiepDia: tiepDiaList,
        PhuKien: phuKienList,
        ThietBi: thietBiList,
    } = allMaterials;

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
    const [exportMode, setExportMode] = useState(false);

    const [temp, setTemp] = useState(false);
    function setState(func) {
        setTemp(!temp);
        func;
    }

    useEffect(() => {
        let data = LockDone(InitData(deepCopy(_data)));
        setData(data);
        setMaterials(InitMat(data));
        // InitToggle(data)
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }, [_data]);

    function findParent(nestedObject, _id) {
        for (let key in nestedObject) {
            if (nestedObject.hasOwnProperty(key)) {
                const value = nestedObject[key];
                if (value?._id === _id) {
                    return value;
                } else if (typeof value === 'object') {
                    const result = findParent(value, _id);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        return null;
    }

    const RotatedTh = ({ className, children }) => {
        return (
            <Box as="th" className={`vertical ${className ?? ''}`}>
                <span className="vertical">{children}</span>
            </Box>
        );
    };

    const RotatedParentTh = ({ matText, matList, _data, children }) => {
        let [disableBottomButton, setDisableBottomButton] = useState(false);

        function handleAddedMaterial(addedMaterial) {
            data.routes.map((route) => {
                route.stations.map((station) => {
                    station.pillars.map((pillar) => {
                        if (pillar[matText] != undefined) {
                            if (addedMaterial.length === 0) {
                                delete pillar[matText];
                            } else {
                                let newMats = [];
                                pillar[matText].map((mat) => {
                                    if (addedMaterial.includes(mat.detail._id)) {
                                        newMats.push(mat);
                                    }
                                });
                                pillar[matText] = newMats;
                            }
                        }
                    });
                });
            });
            setMaterials({ ...materials, [matText]: addedMaterial });
        }

        return (
            <>
                <Box
                    as="th"
                    className={`vertical primary text-white`}
                    onClick={() => {
                        disableBottomButton == false &&
                            setHeadingToggles({
                                ...headingToggles,
                                [`toggle${matText}`]: !headingToggles[`toggle${matText}`],
                            });
                    }}
                >
                    <div className="flex flex-col h-h justify-between">
                        <div className="flex flex-col-reverse items-center">
                            {editing && (
                                <AddMaterial
                                    matList={matList}
                                    currentMatList={_data}
                                    onAddedMaterial={handleAddedMaterial}
                                >
                                    <IconButton
                                        size="sm"
                                        onMouseOver={() => setDisableBottomButton(true)}
                                        onMouseLeave={() => setDisableBottomButton(false)}
                                        background="#dddddd33"
                                        color="white"
                                        icon={<AiFillSetting />}
                                    />
                                </AddMaterial>
                            )}
                            <Icon
                                className="mt-2.5 mb-2.5"
                                as={headingToggles[`toggle${matText}`] ? HiOutlineChevronLeft : HiOutlineChevronRight}
                                fontSize="1rem"
                            />
                        </div>
                        <span className="vertical mx-auto">{children}</span>
                    </div>
                </Box>
                {headingToggles[`toggle${matText}`] && (
                    <>
                        {_data.map((mat) => {
                            let name = '';
                            for (let i = 0; i < matList?.length; i++) {
                                if (matList[i]._id === mat.split('_')[0]) {
                                    name = `${matList[i].name}${mat.split('_')[1] ? ' (thu hồi)' : ''} `;
                                    break;
                                }
                            }
                            return <Th>{name}</Th>;
                        })}
                    </>
                )}
            </>
        );
    };

    function handleAddedLocation(addedLocation, type, parentIndex, index) {
        let newData = { ...data };

        switch (type) {
            case 'route': {
                let toggleLength = Object.keys(routeToggles).length;
                let toggle = { ...routeToggles };
                addedLocation
                    .split('\n')
                    .filter(Boolean)
                    .map((location) => {
                        newData.routes.push({ name: location.trim(), stations: [] });
                        toggle[`toggle${toggleLength}`] = true;
                        toggleLength++;
                    });

                setRouteToggles(toggle);
                break;
            }
            case 'station': {
                let toggleLength = 0;
                let toggle = { ...stationToggles };
                for (const key in stationToggles) {
                    if (key.startsWith(`toggle${index}`)) {
                        toggleLength++;
                    }
                }
                addedLocation
                    .split('\n')
                    .filter(Boolean)
                    .map((location) => {
                        newData.routes[index].stations.push({
                            name: location.trim(),
                            pillars: [],
                        });
                        toggle[`toggle${index}-${toggleLength}`] = true;
                        toggleLength++;
                    });

                setStationToggles(toggle);
                break;
            }
            case 'pillar': {
                addedLocation
                    .split('\n')
                    .filter(Boolean)
                    .map((location) => {
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
    }

    const RouteTr = ({ index, _data, children }) => {
        let [disableBottomButton, setDisableBottomButton] = useState(false);
        const [showAddMaterial, setShowAddMaterial] = useState(false);

        function handleChangedRoute(changedRoute) {
            let newData = { ...data };
            newData.routes[index].name = changedRoute;
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
                    className={'text-white text-center'}
                    as={'tr'}
                    onClick={() => {
                        disableBottomButton == false &&
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
                                    as={routeToggles[`toggle${index}`] ? HiOutlineChevronUp : HiOutlineChevronDown}
                                ></Icon>
                                {editing && (
                                    <AddLocation
                                        type={'station'}
                                        onAddedLocation={handleAddedLocation}
                                        setDisableBottomButton={setDisableBottomButton}
                                        index={index}
                                    />
                                )}
                                <EditLocation
                                    isOpen={showAddMaterial}
                                    type={'route'}
                                    name={children}
                                    setDisableBottomButton={setDisableBottomButton}
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
                        {_data.stations.map((station, stationIndex) => {
                            return (
                                <StationTr parentIndex={index} index={stationIndex} _data={station}>
                                    {station.name}
                                </StationTr>
                            );
                        })}
                        <SumTr _data={_data} mode={'sum'}>
                            Tổng cộng
                        </SumTr>
                        <SumTr _data={_data} mode={'done'}>
                            Đã xong
                        </SumTr>
                    </>
                )}
            </>
        );
    };

    const StationTr = ({ parentIndex, index, title, _data, children }) => {
        let [disableBottomButton, setDisableBottomButton] = useState(false);
        const [showAddMaterial, setShowAddMaterial] = useState(false);

        function handleChangedStation(changedStation) {
            let newData = { ...data };
            newData.routes[parentIndex].stations[index].name = changedStation;
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
                    className={'text-white text-center'}
                    as={'tr'}
                    onClick={() => {
                        disableBottomButton == false &&
                            setStationToggles({
                                ...stationToggles,
                                [`toggle${parentIndex}-${index}`]: !stationToggles[`toggle${parentIndex}-${index}`],
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
                                        type={'pillar'}
                                        onAddedLocation={handleAddedLocation}
                                        setDisableBottomButton={setDisableBottomButton}
                                        parentIndex={parentIndex}
                                        index={index}
                                    ></AddLocation>
                                )}
                                <EditLocation
                                    isOpen={showAddMaterial}
                                    type={'station'}
                                    name={children}
                                    onChangedLocation={handleChangedStation}
                                    setDisableBottomButton={setDisableBottomButton}
                                    onDeletedLocation={handleDeletedStation}
                                    onClose={() => setShowAddMaterial(false)}
                                />
                            </div>
                        </Box>
                    </td>
                </Box>
                {stationToggles[`toggle${parentIndex}-${index}`] &&
                    _data.pillars.map((pillar, pillarIndex) => {
                        const [_showAddMaterial, _setShowAddMaterial] = useState(false);
                        function handleChangedPillar(changedPillar) {
                            let newData = { ...data };
                            newData.routes[parentIndex].stations[index].pillars[pillarIndex].name = changedPillar;
                            setData(newData);
                        }

                        function handleDeletedPillar() {
                            let newData = { ...data };
                            newData.routes[parentIndex].stations[index].pillars.splice(pillarIndex, 1);
                            setData(newData);
                        }

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
                                                                    setState((mat.export = !mat.export));
                                                                else if (!exportMode && !mat.locked)
                                                                    mat.isDone = !mat.isDone;
                                                            });
                                                        });
                                                        setState();
                                                    }
                                                }}
                                                onContextMenu={() => editing && _setShowAddMaterial(true)}
                                            >
                                                {pillar.name}
                                            </div>
                                            <EditLocation
                                                isOpen={_showAddMaterial}
                                                type={'pillar'}
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
                                            onValueChange={(newValue) => setState((pillar.distance = newValue))}
                                        />
                                    </td>
                                    <td>
                                        <ValueBox
                                            canEdit={editing}
                                            value={pillar.middleLine}
                                            onValueChange={(newValue) => setState((pillar.middleLine = newValue))}
                                        />
                                    </td>
                                    <td>
                                        <ValueBox
                                            canEdit={editing}
                                            value={pillar.lowLine}
                                            onValueChange={(newValue) => setState((pillar.lowLine = newValue))}
                                        />
                                    </td>
                                    {matTextList.map((matText) => {
                                        return <ValueTd matText={matText} pillarMaterials={pillar} />;
                                    })}
                                </tr>
                            </>
                        );
                    })}
            </>
        );
    };

    const SumTr = ({ _data, mode, children }) => {
        let sumArr = {
            distance: 0,
            middleLine: 0,
            lowLine: 0,
        };

        _data.stations.map((station) => {
            station.pillars.map((pillar) => {
                sumArr.distance += pillar?.distance || 0;
                sumArr.middleLine += pillar?.middleLine || 0;
                sumArr.lowLine += pillar?.lowLine || 0;

                matTextList.map((matText) => {
                    if (sumArr[matText] === undefined) sumArr[matText] = {};
                    if (pillar[matText] !== undefined) {
                        pillar[matText].map((mat) => {
                            if (mat.detail !== null)
                                if (mode === 'sum' || (mode === 'done' && mat.isDone)) {
                                    if (sumArr[matText][mat.detail._id] === undefined) {
                                        sumArr[matText][mat.detail._id] = mat.quantity;
                                    } else {
                                        // sumArr[matText][mat.detail._id] += mat.quantity;
                                        sumArr[matText][mat.detail._id] = Number(
                                            (sumArr[matText][mat.detail._id] + mat.quantity).toFixed(2),
                                        );
                                    }
                                }
                        });
                    }
                });
            });
        });

        return (
            <tr>
                <td
                    className={`${
                        children === 'Đã xong' ? 'bg-[#6dcacf]' : 'bg-[#ffcb8b]'
                    } font-bold text-black p-2 text-center`}
                >
                    {children}
                </td>
                <td className={`${children === 'Đã xong' ? 'bg-white' : 'bg-[#ffcb8b]'}`}>
                    <ValueBox canEdit={false} value={children === 'Tổng cộng' && sumArr.distance} />
                </td>
                <td className={`${children === 'Đã xong' ? 'bg-white' : 'bg-[#ffcb8b]'}`}>
                    <ValueBox canEdit={false} value={children === 'Tổng cộng' && sumArr.middleLine} />
                </td>
                <td className={`${children === 'Đã xong' ? 'bg-white' : 'bg-[#ffcb8b]'}`}>
                    <ValueBox canEdit={false} value={children === 'Tổng cộng' && sumArr.lowLine} />
                </td>
                {matTextList.map((matText) => {
                    return (
                        <>
                            <td className="bg-white"></td>
                            {headingToggles[`toggle${matText}`] &&
                                materials[matText].map((mat) => {
                                    return (
                                        <td className={`${children === 'Đã xong' ? 'bg-[#6dcacf]' : 'bg-[#ffcb8b]'}`}>
                                            <ValueBox canEdit={false} value={sumArr[matText]?.[mat] || 0} />
                                        </td>
                                    );
                                })}
                        </>
                    );
                })}
            </tr>
        );
    };

    const ValueTd = ({ matText, pillarMaterials, canEdit = true }) => {
        let materialIDs = materials[matText];
        let mats = pillarMaterials[matText];
        return (
            <>
                <td className="bg-white"></td>
                {headingToggles[`toggle${matText}`] &&
                    materialIDs.map((matID) => {
                        if (mats === undefined) {
                            return (
                                <td>
                                    <ValueBox
                                        comment={''}
                                        needComment={!data.isOriginal}
                                        canEdit={editing}
                                        value={''}
                                        onValueChange={(newValue) => {
                                            pillarMaterials[matText] = [];
                                            setState(
                                                pillarMaterials[matText].push({
                                                    detail: {
                                                        _id: matID,
                                                    },
                                                    quantity: newValue,
                                                    comment: '',
                                                }),
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
                                                }),
                                            );
                                        }}
                                    />
                                </td>
                            );
                        }

                        let value = undefined;
                        for (let i = 0; i < mats.length; i++) {
                            if (mats[i].detail !== null && matID === mats[i].detail._id) {
                                value = (
                                    <td
                                        style={{ position: 'relative' }}
                                        className={
                                            mats[i].isDone && (mats[i].locked ? 'bg-[#4BE383]/75' : 'bg-orange-300')
                                        }
                                        onClick={() => {
                                            if (
                                                mats[i].locked !== true &&
                                                editing === false &&
                                                exportMode === false &&
                                                mats[i].quantity !== null
                                            )
                                                setState((mats[i].isDone = !mats[i].isDone));

                                            if (exportMode && mats[i].locked && mats[i].isDone)
                                                setState((mats[i].export = !mats[i].export));
                                        }}
                                    >
                                        <ValueBox
                                            origValue={mats[i].comment !== '' && findParent(orig.routes, mats[i]._id)}
                                            comment={mats[i].comment}
                                            needComment={!data.isOriginal}
                                            canEdit={editing}
                                            value={mats[i].quantity}
                                            onValueChange={(newValue) => {
                                                setState((mats[i].quantity = newValue));
                                            }}
                                            onValueAndCommentSubmit={({ quantity, comment }) => {
                                                mats[i].quantity = quantity;
                                                setState((mats[i].comment = comment));
                                            }}
                                        />
                                        {mats[i].comment !== '' && (
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

                                        {exportMode && mats[i].export && (
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
                                break;
                            }
                        }

                        return value != undefined ? (
                            value
                        ) : (
                            <td>
                                <ValueBox
                                    comment={''}
                                    needComment={!data.isOriginal}
                                    canEdit={editing && canEdit}
                                    value={''}
                                    onValueChange={(newValue) => {
                                        setState(
                                            pillarMaterials[matText].push({
                                                detail: {
                                                    _id: matID,
                                                },
                                                quantity: newValue,
                                                comment: '',
                                            }),
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
                                            }),
                                        );
                                    }}
                                />
                            </td>
                        );
                    })}
            </>
        );
    };

    const Th = ({ children }) => {
        return (
            <Box as="th" className="align-bottom" bg={'#EDF2F666'}>
                <span className="rotate">{children}</span>
            </Box>
        );
    };

    {
        /* MODAL STUFFS */
    }

    const timestamp = new Date(data.updatedAt);
    const formattedTimestamp = timestamp.toLocaleString('vi-VN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return (
        <>
            <Flex className="flex justify-between items-center mb-3 z-50">
                <div>
                    <p className="font-bold text-md mt-2"> Tổng kê </p>
                    <p className="text-xs mb-3">
                        {editing
                            ? '(chế độ chỉnh sửa)'
                            : exportMode
                            ? '(chế độ xuất biên bản)'
                            : `Cập nhật lần cuối vào ${formattedTimestamp}.`}
                    </p>
                </div>
                {!exportMode ? (
                    <div className="flex gap-2">
                        {!editing && (
                            <Button onClick={() => setEditing(true)} leftIcon={<HiWrenchScrewdriver />}>
                                Chỉnh sửa
                            </Button>
                        )}
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
                        {!editing && (
                            <Button onClick={() => setExportMode(true)} leftIcon={<FaFileExport />}>
                                {'Xuất biên bản'}
                            </Button>
                        )}
                        <Popover placement="left">
                            {({ isOpen, onClose }) => (
                                <>
                                    <PopoverTrigger>
                                        <Button background={'#FF645B'} color={'#FFFFFF'} leftIcon={<FaSave />}>
                                            {'Lưu'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto">
                                        <PopoverArrow />
                                        <PopoverBody>
                                            <Flex className="flex items-center gap-2">
                                                Bạn có chắc chắn chưa?
                                                <Button
                                                    colorScheme="red"
                                                    onClick={async () => {
                                                        let _data = preparePost(deepCopy(data));
                                                        await dispatch(addSummary({ _data, slug }));
                                                        if (editing) setEditing(false);
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
                ) : (
                    <div>
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
                                                        setExportMode(false);
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
                        <ExportWordModal data={preparePost(deepCopy(data))}>
                            <Button
                                className="ml-2"
                                background={'#FF645B'}
                                color={'#FFFFFF'}
                                leftIcon={<FaFileExport />}
                            >
                                {'Xuất biên bản'}
                            </Button>
                        </ExportWordModal>
                    </div>
                )}
            </Flex>

            <div style={{ overflowX: 'auto' }} className="table-wrapper">
                {/* First Row */}

                <table className="big-table">
                    <tr>
                        <th className="text-white primary w-64">
                            <div className="w-64">
                                {' '}
                                <div className="absolute inset-x-0 bottom-0 ml-2 mr-2 mb-2">
                                    <Flex className="flex justify-between">
                                        <div className="flex gap-1.5">
                                            <IconButton
                                                size="sm"
                                                background="#dddddd33"
                                                color="white"
                                                icon={<FaExpandArrowsAlt />}
                                                onClick={() => {
                                                    setRouteToggles(
                                                        Object.fromEntries(
                                                            Object.keys(routeToggles).map((key) => [key, true]),
                                                        ),
                                                    );
                                                    setStationToggles(
                                                        Object.fromEntries(
                                                            Object.keys(stationToggles).map((key) => [key, true]),
                                                        ),
                                                    );
                                                }}
                                            />
                                            <IconButton
                                                size="sm"
                                                background="#dddddd33"
                                                color="white"
                                                icon={<FaCompressArrowsAlt />}
                                                onClick={() => {
                                                    setRouteToggles(
                                                        Object.fromEntries(
                                                            Object.keys(routeToggles).map((key) => [key, false]),
                                                        ),
                                                    );
                                                    setStationToggles(
                                                        Object.fromEntries(
                                                            Object.keys(stationToggles).map((key) => [key, false]),
                                                        ),
                                                    );
                                                }}
                                            />
                                        </div>
                                        {editing && (
                                            <AddLocation type={'route'} onAddedLocation={handleAddedLocation}>
                                                {' '}
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
                        {/*  REFERENCES
            <RotatedParentTh matText={"dayDans"} matList={dayDanList} _data={materials.dayDans}>Dây dẫn</RotatedParentTh>
            <RotatedParentTh matText={"trus"} matList={truList} _data={materials.trus}>Trụ</RotatedParentTh>
            <RotatedParentTh matText={"mongs"} matList={mongList} _data={materials.mongs}>Móng</RotatedParentTh>
            <RotatedParentTh matText={"boChangs"} matList={boChangList} _data={materials.boChangs}>Bộ chằng</RotatedParentTh> */}
                        {matTextList.map((matText, index) => {
                            let matList;
                            switch (matText) {
                                case 'dayDans':
                                    matList = dayDanList;
                                    break;
                                case 'trus':
                                    matList = truList;
                                    break;
                                case 'mongs':
                                    matList = mongList;
                                    break;
                                case 'das':
                                    matList = daList;
                                    break;
                                case 'xaSus':
                                    matList = xaSuList;
                                    break;
                                case 'boChangs':
                                    matList = boChangList;
                                    break;
                                case 'tiepDias':
                                    matList = tiepDiaList;
                                    break;
                                case 'phuKiens':
                                    matList = phuKienList;
                                    break;
                                case 'thietBis':
                                    matList = thietBiList;
                                    break;
                            }
                            return (
                                <RotatedParentTh matText={matText} matList={matList} _data={materials[matText]}>
                                    {matNameList[index]}
                                </RotatedParentTh>
                            );
                        })}
                    </tr>

                    {/* Row */}
                    {data.routes.map((route, routeIndex) => {
                        return (
                            <>
                                <RouteTr index={routeIndex} _data={route}>
                                    {route.name}
                                </RouteTr>
                            </>
                        );
                    })}
                </table>
            </div>
        </>
    );
}

export default Table;
