
import React, { useEffect, useState } from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    useDisclosure,
    Flex,
    Box,
    Checkbox,
} from '@chakra-ui/react';
import Datepicker from '../../partials/actions/Datepicker';
import ErrorMessage from '../../utils/ErrorMessage';
import { Controller, useForm } from 'react-hook-form';
import { uploadTimesheet } from '../../features/project/projectSlice';
import { useDispatch } from "react-redux";
import { showToast } from '../../utils/toast';
import { axios } from '../../utils/axios';
import { saveAs } from 'file-saver';

const ExportWordModal = ({ children, data }) => {
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

    const [exportData, setExportData] = useState({})

    const matTextList = [
        "dayDans",
        "trus",
        "mongs",
        "boChangs",
        "tiepDias",
        "thietBis",
        "thietBis",
    ];
    const matTextTemplateList = [
        "pyc",
        "thuhoi",
        "betong",
        "dayDans",
        "trus",
        "mongs",
        "boChangs",
        "tiepDias",
        "thietBis",
        "thietBis",
    ];
    const templateList = [
        "PYC_NT",
        "BM_ThuHoi",
        "BM_Betong",
        "BM_KeoDay",
        "BM_Tru",
        "BM_Mong",
        "BM_Neo",
        "BM_TiepDia",
        "BM_Tram",
        "BM_LapDatPD",
    ];

    const [checkers, setCheckers] = useState({});
    const [category, setcategory] = useState({});

    const [items, setItems] = useState({});

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        handleSubmit,
        register,
        control,
        reset,
        formState: { errors },
    } = useForm();

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                onClick: () => {
                    let _exportData = deepCopy(data);
                    let items = { 'pyc': 1, 'betong': 1 };
                    _exportData.routes.map((route) => {
                        route.stations.map((station) => {
                            station.pillars.map((pillar) => {
                                matTextList.map((matText) => {
                                    pillar[matText] = pillar[matText].filter(
                                        (mat) => {
                                            const isTrue = mat?.export;
                                            if (mat.isRecalled)
                                                items["thuhoi"] |= isTrue;
                                            else
                                                items[matText] |= isTrue;
                                            return isTrue
                                        }
                                    );
                                });
                            });
                        });
                    });
                    setCheckers(items)
                    setItems(items);
                    setExportData(_exportData)
                    setcategory({
                        'NghiemThu': true,
                        'NoiBo': false,
                    })
                    onOpen();
                }
            });
        }
        return child;
    });

    const onSubmit = async (formData) => {
        if (!Object.values(checkers).every((v) => (v === 0 || v === false)) && !Object.values(checkers).every((v) => (v === false))) {
            ExportSummary(exportData, checkers, formData.date)
            onClose()
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    function ExportSummary(data, items, date) {
        Object.keys(category).map((cat) => {
            if (category[cat])
                matTextTemplateList.map((matText, index) => {
                    const fileName = `${templateList[index]}${matText !== 'pyc' ? `_${cat}` : ""}_${new Date().toISOString()}`;
                    if (items[matText] && !(matText === 'pyc' && cat === 'NoiBo')) {
                        let send_data = {
                            templateName: matText === 'pyc' ? "PYC_NT" : `${templateList[index]}.${cat}`,
                            wordFileName: fileName,
                            projectId: data.project,
                            // title: matText,
                            dataExport: {
                                date: date,
                                routes: data.routes,
                            },
                        };

                        axios
                            .post(`/activities/export`, send_data, {
                                responseType: "arraybuffer",
                            })
                            .then(function (response) {
                                const url = new Blob([response.data], { type: "application/zip" });
                                saveAs(url, `${fileName}.docx`);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }
                });
        })

        showToast("success", "Đã xuất biên bản.");
    }

    return (
        <>
            {/* Button */}
            {childrenWithProps}
            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Xuất biên bản</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Ngày</FormLabel>
                            <Controller
                                name='date'
                                control={control}
                                defaultValue={new Date()}
                                rules={{
                                    required: true,
                                }}
                                render={({ field }) => (
                                    <Datepicker
                                        defaultDate={new Date()}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Loại biên bản</FormLabel>
                            <div className='grid grid-cols-2'>
                                <>
                                    <Checkbox
                                        onChange={(e) => setcategory({ ...category, [`NghiemThu`]: e.target.checked })}
                                        defaultChecked
                                    >
                                        Nghiệm thu
                                    </Checkbox>
                                    <Checkbox
                                        onChange={(e) => setcategory({ ...category, [`NoiBo`]: e.target.checked })}
                                    >
                                        Nội bộ
                                    </Checkbox>
                                </>

                            </div>
                            {Object.values(category).every((v) => (v === false)) && <ErrorMessage msg='Vui lòng chọn ít nhất một loại biên bản.' />}
                        </FormControl>
                    </ModalBody>
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Biên bản</FormLabel>
                            <div className='grid grid-cols-2'>
                                <>
                                    {matTextTemplateList.map((matText, index) => {
                                        return <>
                                            <Checkbox
                                                onChange={(e) => setCheckers({ ...checkers, [`${matText}`]: e.target.checked })}
                                                isDisabled={!items[matText]}
                                                defaultChecked={items[matText]}
                                            >
                                                {templateList[index]}
                                            </Checkbox>
                                        </>
                                    })}
                                </>

                            </div>
                            {Object.values(checkers).every((v) => (v === 0 || v === false)) && <ErrorMessage msg='Vui lòng chọn ít nhất một biên bản.' />}
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button className='mr-2' onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button colorScheme="red" onClick={handleSubmit(onSubmit)}>
                            Xuất biên bản
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ExportWordModal;
