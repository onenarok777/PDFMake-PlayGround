import { useState, useEffect } from "react";

import AceEditor from "react-ace";
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/ext-language_tools";
ace.config.set("basePath", "/node_modules/ace-builds/src-min-noconflict");

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

export default function App() {
	useEffect(() => {
		getCoding();
	}, []);

	const initContent = `
	const docDefinition = {
		info: {
			title: 'Demo De Jai',
		},
		content: [
			'Hello สวัสดี'
		],
		defaultStyle: {
			font: 'Prompt'
		}
	}
  	`;
	const [docDefinition, setDocDefinition] = useState();

	const [pdfURl, setPdfUrl] = useState();

	const registerFonts = async () => {
		const fontFile = "Prompt-Regular.ttf";
		const response = await fetch(`/src/assets/fonts/${fontFile}`);
		const blob = await response.blob();
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		pdfFonts.pdfMake.vfs[fontFile] = await new Promise((resolve) => {
			reader.onloadend = () => {
				resolve(reader.result.replace("data:font/ttf;base64,", ""));
			};
		});
	};

	const getCoding = async () => {
		let content = await localStorage.getItem("PDFMake");
		if (!content) {
			localStorage.setItem("PDFMake", initContent);
			content = initContent;
		}

		setDocDefinition(content);
		generatePdf(content);
	};

	const onChangeCoding = (event) => {
		setDocDefinition(event);
		localStorage.setItem("PDFMake", event);
		generatePdf(event);
	};

	const generatePdf = async (event) => {
		try {
			await registerFonts();
			const content = new Function(event + "; return docDefinition;")();
			pdfMake.vfs = pdfFonts.pdfMake.vfs;
			pdfMake.fonts = {
				Prompt: {
					normal: "Prompt-Regular.ttf",
				},
			};

			pdfMake.createPdf(content).getBlob(function (blob) {
				setPdfUrl(URL.createObjectURL(blob));
			});
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<>
			<div className="flex flex-col h-screen" data-theme="light">
				<div className="h-14 w-full flex justify-center items-center bg-sky-600">
					<div className="text-xl font-bold text-white">
						PDFMake Playground
					</div>
				</div>
				<div className="h-full flex flex-col-reverse  lg:flex-row">
					<div className="h-1/2 lg:h-full lg:w-1/2 ">
						<AceEditor
							mode="javascript"
							theme="monokai"
							onChange={onChangeCoding}
							width="100%"
							height="100%"
							value={docDefinition}
							setOptions={{
								useWorker: false,
								enableBasicAutocompletion: true,
								enableLiveAutocompletion: true,
								enableSnippets: true,
								showLineNumbers: true,
								tabSize: 2,
							}}
						/>
					</div>
					<div className="h-1/2 lg:h-full lg:w-1/2 ">
						<object
							data={pdfURl}
							type="application/pdf"
							width="100%"
							height="100%"
						></object>
					</div>
				</div>
				<div className="h-5 bg-slate-700 flex justify-center items-center">
					<div className="text-white text-xs">© 2024 By ZomJeedz</div>
				</div>
			</div>
		</>
	);
}
