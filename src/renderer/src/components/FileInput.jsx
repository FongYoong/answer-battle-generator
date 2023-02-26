import { useState, useMemo, useEffect, useImperativeHandle, forwardRef } from "react"
import { Flex, Text, FormLabel, FormControl, Button } from "@chakra-ui/react"
import { MdPreview, MdOutlineFileUpload, MdDownload } from 'react-icons/md'
import { BsImage } from 'react-icons/bs'
import { AiFillSound } from 'react-icons/ai'

const FileInput = forwardRef(({save=false, name, label, type, defaultFile=undefined, ...props}, ref) => {

    const [defaultOutputPath, setDefaultOutputPath] = useState('')
    const [file, setFile] = useState(undefined)
    const [fileName, setFileName] = useState(undefined)
    const isDefault = file == undefined;
    const filePath = isDefault ? defaultFile : file

    useImperativeHandle(ref, () => ({
        getName: () => name,
        getFile: () => file
    }), [file]);

    const leftIcon = useMemo(() => {
        if (type == 'image') {
            return <BsImage size='1.5em' />
        }
        else if (type == 'audio') {
            return <AiFillSound size='1.5em' />
        }
        else if (type == 'html') {
            return <MdDownload size='1.5em' />
        }
    }, [type])

    useEffect(() => {
        window.api.getDefaultOutputPath().then((path) => {
            setDefaultOutputPath(path)
            if (save) {
                setFile(path)
            }
        })
    }, [])

    return (
        <FormControl py={2} w='100%' {...props} >
            <Flex>
                {leftIcon}
                <FormLabel ml={2} fontSize='lg' >
                    {label}
                </FormLabel>
            </Flex>
            <Flex align='center' w='100%' >
                <Flex flex={1} mr={1} overflow='hidden' cursor='pointer'
                    bg='#e8e8e8' _hover={{ bg: '#b8b8b8' }} borderRadius='0.2em' p={2} align='center' justify='center'
                    onClick={async () => {
                        if (save) {
                            const result = await window.api.chooseSaveFile()
                            if (result) {
                                const [selectedFile, fileName] = result
                                setFile(selectedFile)
                                setFileName(fileName)
                            }
                        }
                        else {
                            const result = await window.api.openFile(type, file)
                            if (result) {
                                const [selectedFile, fileName] = result
                                setFile(selectedFile)
                                setFileName(fileName)
                            }
                        }

                    }}
                >
                    {!save && <MdOutlineFileUpload size='1em' />}
                    <Text w='100%' textAlign='left' ml={1} textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap' >
                        {file ? (save ? file : fileName) : (save ? defaultOutputPath : 'Use default file.')}
                    </Text>
                </Flex>
                {!save &&
                    <Button mr={2} colorScheme='teal' leftIcon={<MdPreview size='1.5em' />}
                        onClick={() => {
                            window.api.previewFile(filePath, isDefault)
                        }}
                    >
                        Preview
                    </Button>
                }
            </Flex>

        </FormControl>
    )
})

export default FileInput