// import icons from './assets/icons.svg'
import { useState, useEffect, useMemo, useRef } from "react"
import { Box, Flex, Stack, Button, Text, Input, FormControl, FormLabel, Divider, useDisclosure,
Modal,
ModalOverlay,
ModalContent,
ModalHeader,
ModalBody,
} from "@chakra-ui/react"
import FileInput from "./components/FileInput"
import { defaultRoundsText, convertRoundsTextToJSON } from "./lib/rounds"
import { VscDebugStart } from 'react-icons/vsc'
import { BsChatLeftTextFill } from 'react-icons/bs'
import { NewtonsCradle } from '@uiball/loaders'

import { SiGamejolt } from 'react-icons/si'
import * as monaco from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker()
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker()
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker()
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker()
    }
    return new editorWorker()
  }
}
loader.config({ monaco });
loader.init().then(/* ... */);

const errorLineRegex = /^Line\s*(\d+)\s*:/;

const fileInputs = [
  {
    name:"globeImage", label:"Main Logo", type:'image', defaultFile:"images/globe.png"
  },
  {
    name:"backgroundImage", label:"Background Image", type:'image', defaultFile:"images/background.jpg"
  },
  {
    name:"themeRoundSound", label:"Main Theme", type:'audio', defaultFile:"audio/theme_round.mp3"
  },
  {
    name:"winSound", label:"Win Sound", type:'audio', defaultFile:"audio/response_win.mp3"
  },
]

function App() {

  const loadingModalState = useDisclosure()
  const titleInputRef = useRef()
  const fileInputRefs = useRef([...Array(fileInputs.length)])
  const outputFileRef = useRef()
  const roundsEditorRef = useRef(null);
  const roundsEditorDecorationsRef = useRef([]);
  const [roundsText, setRoundsText] = useState(defaultRoundsText)
  const [roundError, roundErrorMessage, roundErrorLine] = useMemo(() => {
    const editor = roundsEditorRef.current
    const roundsJSON = convertRoundsTextToJSON(roundsText)
    if (editor) {
      if (roundsJSON instanceof Error) {
        const errorMessage = roundsJSON.message
        const errorLine = parseInt(roundsJSON.message.match(errorLineRegex)[1])
        roundsEditorDecorationsRef.current = editor.deltaDecorations(
          roundsEditorDecorationsRef.current,
          [
            {
              range: new monaco.Range(errorLine, 1, errorLine, 1),
              options: {
                isWholeLine: true,
                inlineClassName: "editorInlineDecoration",
                linesDecorationsClassName: "editorLineDecoration",
                hoverMessage: {
                  value: `<b>${errorMessage}</b>`,
                  supportHtml: true,
                }
              },
            }
          ]
        );
        return [true, errorMessage, errorLine]
      }
      else {
        roundsEditorDecorationsRef.current = editor.deltaDecorations(
          roundsEditorDecorationsRef.current,
          []
        );
      }
    }
    return [false, undefined, undefined]
  }, [roundsText])

  // useEffect(() => {
  //   window.api.onOpenAboutPage((_event) => {
  //     alert('about')
  //   })
  // }, [])

  const onGenerate = () => {
    loadingModalState.onOpen();

    const general = {
      title: titleInputRef.current.value
    }

    const assets = fileInputRefs.current.map((f) => {
      return {
        name: `@asset_${f.getName()}`,
        file: f.getFile()
      }
    })

    const data = {
      general,
      assets,
      rounds: convertRoundsTextToJSON(roundsText),
      outputPath: outputFileRef.current.getFile()
    }

    window.api.generate(data).then(() => {
      loadingModalState.onClose();
    }).catch((e) => {
      console.log(e)
      loadingModalState.onClose();
    })
  }

  return (
    <Stack w='100vw' align='center' justify='center' px={4} py={0} >
      <Text fontSize='3xl' fontWeight='extrabold' >
        Answer Battle Generator
      </Text>
      <Flex w='100%' align='flex-start' justify='center' >
        <Stack w='40%' >
          <FormControl w='100%'>
            <Flex w='100%' >
                <BsChatLeftTextFill size='1.5em' />
                <FormLabel ml={2} fontSize='lg' >
                  Title
                </FormLabel>
            </Flex>
            <Input ref={titleInputRef} name='title' placeholder="Answer Battle" defaultValue="Answer Battle" />
          </FormControl>
          {fileInputs.map((f, index) =>
            <FileInput key={index} name={f.name} label={f.label} type={f.type} defaultFile={f.defaultFile} 
              ref={(el) => fileInputRefs.current[index] = el}
            />
          )}
          <FileInput save name='output' label="Save to" type='html'
            ref={outputFileRef}
          />
          <Button mt={8} colorScheme='blue' size='lg' leftIcon={<VscDebugStart />}
            onClick={onGenerate} isDisabled={roundError}
          >
            Generate
          </Button>
        </Stack>
        <Stack ml={4} w='60%' h='100%' align='flex-start' justify='flex-start' >
          <Flex w='100%' >
            <SiGamejolt size='1.5em' />
            <Text ml={2} w='100%' textAlign='start' fontSize='lg' fontWeight='bold' >
              Rounds
            </Text>
          </Flex>
          <Box w='100%' h='70vh' border='2px solid black' >
            <Editor
              height="100%"
              value={roundsText}
              placeholder='Type rounds here'
              onChange={(value, event) => {
                setRoundsText(value)
              }}
              onMount={(editor, monaco) => {
                roundsEditorRef.current = editor
              }}
              options={{
                minimap: {
                  enabled: false
                },
                selectionHighlight: false,
                wordBasedSuggestions: false,
                renderValidationDecorations: "off"
              }}
            />
          </Box>
        </Stack>
      </Flex>
      <Divider />
      <Modal closeOnEsc={false} closeOnOverlayClick={false}
        isOpen={loadingModalState.isOpen} onClose={loadingModalState.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generating...</ModalHeader>
          <ModalBody>
            <Stack w='100%' align='center' justify='center' >
              <NewtonsCradle 
                size={40}
                speed={1.4} 
                color="black" 
              />
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  )
}

export default App