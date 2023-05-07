import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { IoAdd } from 'react-icons/io5';
import { BsSortAlphaDown, BsSortAlphaUp } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux';
import { getMaterials } from '../features/materialSlice';
import MaterialView from '../components/modals/MaterialView';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';

const Materials = () => {

  const materialTypes = [
    {
      id: "DayDan",
      text: "Dây dẫn"
    },
    {
      id: "Tru",
      text: "Trụ"
    },
    {
      id: "Mong",
      text: "Móng"
    },
    {
      id: "Da",
      text: "Đà"
    },
    {
      id: "XaSu",
      text: "Xà sứ"
    },
    {
      id: "BoChang",
      text: "Bó chằng"
    },
    {
      id: "TiepDia",
      text: "Tiếp địa"
    },
    {
      id: "PhuKien",
      text: "Phụ kiện"
    },
    {
      id: "ThietBi",
      text: "Thiết bị"
    }
  ]

  const { materials, isLoading } = useSelector((state) => state.material);
  const { role } = useSelector((state) => state.user.auth);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)

  const [selectedArr, setSelectedArr] = useState([])
  const [order, setOrder] = useState('asc')

  useEffect(() => {
    dispatch(getMaterials());
  }, []);

  useEffect(() => {
    if (!selected) return;
    if (!materials[selected.id])
      setSelectedArr([])
    else
      updateSort(materials[selected.id]);
  }, [materials, selected])

  function updateSort(arr) {
    const sorted = [...arr].sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    setSelectedArr(sorted)
    setOrder('dsc')
  }

  const sortArr = () => {
    if (order === 'asc') {
      const sorted = [...selectedArr].sort((a, b) => {
        return a.name.localeCompare(b.name);
      })
      setSelectedArr(sorted)
      setOrder('dsc');
    } else {
      const sorted = [...selectedArr].sort((b, a) => {
        return a.name.localeCompare(b.name);
      })
      setSelectedArr(sorted)
      setOrder('asc');
    }
  }


  return (
    <Layout>
      <div className='w-full bg-white shadow-lg p-4'>
        <h3 className='h3'>Tất cả vật tư</h3>
        <hr className='mb-6' />
        {isLoading ? <Spinner /> : <div class="flex-1 flex flex-row overflow-y-hidden mt-3">
          <nav class="mt-1 order-first overflow-y-auto"
            style={{ width: '20vw', height: '80vh' }}>
            <div className='overflow-auto flex flex-col rounded-lg mr-3 px-1.5 bg-black/[.025]'
              style={{ height: '80vh' }}>
              {
                materialTypes.map((matType) => {
                  return (
                    <Box
                      className={`flex relative group min-h-[50px] cursor-default ${selected?.id === matType.id ? "bg-[#4a5567] text-white" : "hover:bg-black/[.1]"} mt-2 rounded-md pl-2 px-1`}
                      onClick={() => {
                        setSelected(matType)
                        setSelectedArr(materials[matType.id])
                      }}
                    >
                      <div className='my-auto w-full pr-3'>{matType.text}</div>
                    </Box>
                  )
                })
              }
            </div>
          </nav>
          <Flex className='mt-1 mr-1 flex flex-col gap-3' style={{ width: '80vw', height: '80vh' }}>
            <div className='flex gap-2'>
              <InputGroup>
                <InputLeftElement
                  pointerEvents='none'
                  children={<AiOutlineSearch color='gray.300' />}
                  fontSize='xl'
                />
                <Input isDisabled={!selected} value={search} placeholder='Tìm kiếm' onChange={(event) => {
                  setSearch(event.target.value);
                }} />
              </InputGroup>
              {selected &&
                <Button leftIcon={order === 'asc' ? <BsSortAlphaUp /> : <BsSortAlphaDown />} onClick={() => sortArr()} className='w-36'>
                  Sắp xếp
                </Button>
              }
              {role === 'admin' && selected && <MaterialView matType={selected.id} matTypes={materialTypes} isAdd isAdmin={role === 'admin'}>
                <Button
                  colorScheme="red"
                  leftIcon={<IoAdd color='#fff' />}
                  className='w-44'
                >
                  Thêm vật tư
                </Button>
              </MaterialView>}
            </div>
            <main class="overflow-y-auto flex-1 bg-black/[.025] rounded-lg">
              <div className='overflow-y-auto rounded-lg px-1.5'>
                {
                  selected?.id && selectedArr.map((mat) => {
                    if (mat.name.toLowerCase().includes(search.toLowerCase()) || mat.slug.toLowerCase().includes(search.toLowerCase().replace(/ /gm, '-')))
                      return (
                        <MaterialView matId={mat._id} matType={selected.id} matName={mat.name} matTypes={materialTypes} isAdmin={role === 'admin'}>
                          <Box
                            className={`flex group min-h-[30px] cursor-default  hover:bg-black/[.1] mt-2 rounded-md pl-2 px-1`}
                          >
                            <div className='my-auto w-full pr-3'>
                              {mat.name}
                            </div>
                          </Box>
                        </MaterialView>
                      )
                  })
                }
              </div>
            </main>
          </Flex>
        </div>}
      </div>
    </Layout>
  );
};

export default Materials;
