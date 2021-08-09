const IMAGE_COMPONENT = "image";
const ITEXT_COMPONENT = "i-text";
const POSITION_X = "position_x";
const POSITION_Y = "position_y";
const NAME = "name";
const SCALE_X = "scale_x";
const SCALE_Y = "scale_y";
const PARENT = "parent";
const INPUT = "input";
const FONT_SIZE = "fontsize";
const FONT_FAMILY = "fontfamily";
const ALIGN = "align";
const BOLD = "bold";
const ITALIC = "italic";
const UNDERLINE = "underline";
class Editor {
	isRightClick = false;
	startRigthClick = { x: 0, y: 0 };
	canvasPosition = { x: 0, y: 0 };
	currentActiveObject = null;
	children = [];
	elmentInspektor = null;
	canvas = null;
	parent = null;
	background = null;
	imageComonent = {
		type: "image",
		parentComponent: null,
		position: {
			x: null,
			y: null,
		},
		name: null,
		scale: {
			x: null,
			y: null,
		}


	}
	iTextComponent = {
		type: "i-text",
		parentComponent: null,
		name: null,
		position: {
			x: null,
			y: null,
		},
		input: null,
		fontSize: null,
		fontFamilly: null,
		align: null,
		bold: null,
		italic: null,
		underline: null,
	}
	constructor(idCanvas, width, height) {
		this.canvas = new fabric.Canvas(idCanvas, {
			fireRightClick: true,  // <-- enable firing of right click events
			fireMiddleClick: true, // <-- enable firing of middle click events
			stopContextMenu: true, // <--  prevent context menu from showing
		});

		this.init(width, height)

	}
	init(w, h) {
		this.addParent(w, h);
		this.canvas.zoomToPoint({ x: this.canvas.width / 2, y: this.canvas.height / 2 }, 0.14)
		this.canvas.on('mouse:wheel', function (opt) {
			var delta = opt.e.deltaY;
			var zoom = this.canvas.getZoom();
			zoom *= 0.999 ** delta;
			if (zoom > 20) zoom = 20;
			if (zoom < 0.01) zoom = 0.01;
			this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
			opt.e.preventDefault();
			opt.e.stopPropagation();
		}.bind(this));
		this.canvas.on('mouse:down', function (e) {
			if (e.button == 1) {
				this.isRightClick = false;
				this.update();
				this.generateChildObject();
			} else if (e.button == 3) {
				this.isRightClick = true;

				this.startRigthClick = { x: e.pointer.x, y: e.pointer.y };
			}
		}.bind(this));
		this.canvas.on('mouse:move', function (e) {
			if (this.isRightClick) {
				let deltaX = (this.startRigthClick.x - e.pointer.x);
				let deltaY = (this.startRigthClick.y - e.pointer.y);
				this.startRigthClick.x = e.pointer.x;
				this.startRigthClick.y = e.pointer.y;
				this.canvas.relativePan(new fabric.Point(-deltaX, -deltaY));
			}
		}.bind(this))
		this.canvas.on('mouse:up', function (e) {
			if (e.button == 3) {
				this.isRightClick = false;
			}
		}.bind(this))
		this.canvas.on('object:moving', function () {
			this.update();
		}.bind(this))
		this.canvas.on('object:scaling', function () {
			this.update()
		}.bind(this));

		this.canvas.on('text:changed', function () {
			checkObject();
		}.bind(this))
		this.canvas.on("object:added", function () {
			this.generateChildObject()
		}.bind(this))
		this.canvas.on("object:removed", function () {
			this.generateChildObject()
		}.bind(this))


	}
	setBackgroundById(idBackground) {
		let backgroundElement = document.getElementById(idBackground);
		this.addBackground(backgroundElement.value);
	}
	//setting indikator on left side
	setInspektorElement(idelment) {
		this.elmentInspektor = document.getElementById(idelment);
		this.generateChildObject();
	}
	setNewTextElement(idNewText) {
		let newText = document.getElementById(idNewText);
		newText.onclick = function () { this.newText() }.bind(this);
	}
	setNewImageElement(idNewImage, path) {
		let newImage = document.getElementById(idNewImage);
		newImage.onclick = function () { this.newImage(path) }.bind(this);
	}
	setBackgroundElement(idBackgroundImage) {
		let backgroundElement = document.getElementById(idBackgroundImage);
		backgroundElement.onchange = function (e) {
			this.setBackground(e.target.value);
		}.bind(this);
	}
	setDownloadElement(idDownload) {
		let downloadElement = document.getElementById(idDownload);
		downloadElement.onclick = function (e) {
			this.download();
		}.bind(this);
	}
	setSaveElement(idSave, callback) {
		let saveElement = document.getElementById(idSave);
		saveElement.onclick = function (e) {
			callback(this.save());
		}.bind(this);

	}


	//add text 
	newText() {
		let idx = this.children.length;
		this.addText(this.generateId('text-' + idx), this.parent.left, this.parent.top, 'text ' + idx);
	}
	//add image wiht path , path is path directory of image
	newImage(path) {
		let idx = this.children.length;
		this.addImage(this.generateId('image-' + idx), path, this.parent.left, this.parent.top, 'image ' + idx);
	}
	//setting background of rectangle
	setBackground(path) {
		this.addBackground(path);
	}
	//local add text using parameter index , idx is id of text can't be same with other 
	addText(idx, left, top, name, canMove = true, textInput = "input text here", fontSize = 40, fontFamily = "arial", textAlign = "left", bold = "normal", italic = "italic", underline = false, scalex = 1, scaley = 1) {
		var text = new fabric.IText(textInput, {
			left: left,
			top: top,
			id: idx,
			selectable: canMove,
			fontSize: fontSize,
			fontFamily: fontFamily,
			textAlign: textAlign,
			fontWeight: bold,
			fontStyle: italic,
			underline: underline,
			scaleX: scalex,
			scaleY: scaley,


		});
		text.name = name;
		this.children.push(text);
		this.canvas.add(text);
	}
	//local add image using parameter index and path , idx is id of text can't be same with other , path is path directory of image
	addImage(idx, path, left, top, name, canMove = true, scalex = 1, scaley = 1) {
		fabric.Image.fromURL(path, function (oImg) {
			oImg.left = left;
			oImg.top = top;
			oImg.name = name;
			oImg.id = idx;
			oImg.scaleX = scalex;
			oImg.scaleY = scaley;
			oImg.selectable = canMove;
			this.children.push(oImg);
			this.canvas.add(oImg);
		}.bind(this));
	}
	// set parent with widht and height
	addParent(w = 2480, h = 3508) {
		this.parent = new fabric.Rect({
			left: 300,
			top: 200,
			fill: 'rgba(0,0,0,0)',
			selectable: false,
			stroke: 'rgba(0,0,0,1)',
			strokeWidth: 3,
			originalHeight: h,
			originalWidth: w,
			height: h / 2,
			width: w / 2,
			angle: 0
		});
		this.canvas.add(this.parent);
		this.canvas.centerObject(this.parent);
	}
	//set background with path image
	addBackground(path) {
		if (this.background) {
			this.canvas.remove(this.background);
			this.background = null;
		}
		fabric.Image.fromURL(path, function (oImg) {
			oImg.left = this.parent.left;
			oImg.top = this.parent.top;
			oImg.scaleX = this.parent.width / oImg.width;
			oImg.scaleY = this.parent.height / oImg.height;
			oImg.selectable = false;
			this.background = oImg;
			this.canvas.add(oImg);
			this.canvas.sendToBack(oImg);
		}.bind(this));

	}
	//set element for image component , parameter is id of element html 
	setElementImageComponent(idName = null, idParent = null, idPositionElementX = null, idPositionElementY = null, idScaleElementX = null, idScaleElementY = null) {
		this.imageComonent.name = document.getElementById(idName);
		this.imageComonent.parentComponent = document.getElementById(idParent);
		this.imageComonent.position.x = document.getElementById(idPositionElementX);
		this.imageComonent.position.y = document.getElementById(idPositionElementY);
		this.imageComonent.scale.x = document.getElementById(idScaleElementX);
		this.imageComonent.scale.y = document.getElementById(idScaleElementY);
		this.setComponentFunction(this.imageComonent)
	}
	//set element for text componnent , parameter is id of element html
	setElementTextComponent(idInput, idName = null, idParent = null, idPositionElementX = null, idPositionElementY = null, idFontSize = null, idFontFamily = null, idAlign = null, idBold = null, idItalic = null, idUnderline = null) {
		this.iTextComponent.name = document.getElementById(idName);
		this.iTextComponent.parentComponent = document.getElementById(idParent);
		this.iTextComponent.position.x = document.getElementById(idPositionElementX);
		this.iTextComponent.position.y = document.getElementById(idPositionElementY);
		this.iTextComponent.input = document.getElementById(idInput);
		this.iTextComponent.fontSize = document.getElementById(idFontSize);
		this.iTextComponent.fontFamily = document.getElementById(idFontFamily);
		this.iTextComponent.align = document.getElementById(idAlign);
		this.iTextComponent.bold = document.getElementById(idBold);
		this.iTextComponent.italic = document.getElementById(idItalic);
		this.iTextComponent.underline = document.getElementById(idUnderline);
		this.setComponentFunction(this.iTextComponent);
	}
	//set componet default function
	setComponentFunction(component) {
		this.setOnChangeComponent(component, NAME, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.name = e.target.value;
				this.canvas.renderAll();
				this.generateChildObject();
			}
		}.bind(this));
		this.setOnChangeComponent(component, POSITION_X, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.left = this.parent.left + Number(e.target.value)
				this.canvas.renderAll();
			}

		}.bind(this));

		this.setOnChangeComponent(component, POSITION_Y, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.top = this.parent.top + Number(e.target.value)
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, SCALE_X, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.scaleX = Number(e.target.value)
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, SCALE_Y, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.scaleY = Number(e.target.value)
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, INPUT, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.text = e.target.value;
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, FONT_SIZE, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.fontSize = Number(e.target.value);
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, FONT_FAMILY, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				console.log(e.target.value);
				this.currentActiveObject.fontFamily = e.target.value;
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, ALIGN, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.textAlign = e.target.value;
				this.canvas.renderAll();
			}

		}.bind(this))
		this.setOnChangeComponent(component, BOLD, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.fontWeight = e.target.checked ? "bold" : "normal";
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, ITALIC, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.fontStyle = e.target.checked ? "italic" : "normal";
				this.canvas.renderAll();
			}
		}.bind(this))
		this.setOnChangeComponent(component, UNDERLINE, function (e) {
			//e.target.value to get value change 
			if (this.currentActiveObject) {
				this.currentActiveObject.underline = e.target.checked;
				this.currentActiveObject.set({ dirty: true });
				this.canvas.renderAll();
			}
		}.bind(this))

	}
	//set onchange function of component , name must be using constans type not a strng , and callback is function call  when onchange was called
	setOnChangeComponent(component, name, callback) {
		if (name == NAME && component.name) {
			component.name.oninput = callback;
		} else if (name == POSITION_X && component.position.x) {
			component.position.x.onchange = callback;
		} else if (name == POSITION_Y && component.position.y) {
			component.position.y.onchange = callback;
		} else if (name == SCALE_X && component.scale) {
			component.scale.x.onchange = callback
		} else if (name == SCALE_Y && component.scale) {
			component.scale.y.onchange = callback
		} else if (name == INPUT && component.input) {
			component.input.oninput = callback
		} else if (name == FONT_SIZE && component.fontSize) {
			component.fontSize.onchange = callback;
		} else if (name == FONT_FAMILY && component.fontFamily) {
			component.fontFamily.onchange = callback;
		} else if (name == ALIGN && component.align) {
			component.align.onchange = callback;
		} else if (name == BOLD && component.bold) {
			component.bold.onchange = callback;
		} else if (name == ITALIC && component.italic) {
			component.italic.onchange = callback;
		} else if (name == UNDERLINE && component.underline) {
			component.underline.onchange = callback;
		}
	}

	//update componnet value if objet image is changing
	updateObjectToImageComponent(Object) {
		if (this.imageComonent.name)
			this.imageComonent.name.value = Object.name;
		if (this.imageComonent.position.x)
			this.imageComonent.position.x.value = Object.left - this.parent.left;
		if (this.imageComonent.position.y)
			this.imageComonent.position.y.value = Object.top - this.parent.top;
		if (this.imageComonent.scale.x)
			this.imageComonent.scale.x.value = Object.scaleX;
		if (this.imageComonent.scale.y)
			this.imageComonent.scale.y.value = Object.scaleY;
	}
	//update componnet value if objet text is changing
	updateObjectToTextComponent(Object) {
		if (this.iTextComponent.name)
			this.iTextComponent.name.value = Object.name;
		if (this.iTextComponent.position.x)
			this.iTextComponent.position.x.value = Object.left - this.parent.left;
		if (this.iTextComponent.position.y)
			this.iTextComponent.position.y.value = Object.top - this.parent.top;
		if (this.iTextComponent.input)
			this.iTextComponent.input.value = Object.text;
		if (this.iTextComponent.fontSize)
			this.iTextComponent.fontSize.value = Object.fontSize;
		if (this.iTextComponent.fontFamilly)
			this.iTextComponent.fontFamily.value = Object.fontFamily;
		if (this.iTextComponent.align)
			this.iTextComponent.align.value = Object.textAlign;
		if (Object.fontWeight == "bold") {
			if (this.iTextComponent.bold)
				this.iTextComponent.bold.checked = true;
		} else {
			if (this.iTextComponent.bold)
				this.iTextComponent.bold.checked = false;
		}
		if (Object.fontStyle == "italic") {
			if (this.iTextComponent.italic)
				this.iTextComponent.italic.checked = true;
		} else {
			if (this.iTextComponent.italic)
				this.iTextComponent.italic.checked = false;
		}
		if (Object.underline) {
			if (this.iTextComponent.underline)
				this.iTextComponent.underline.checked = true;
		} else {
			if (this.iTextComponent.underline)
				this.iTextComponent.underline.checked = false;
		}

	}


	//update method to check current object is changing
	update() {
		let tempObj = this.canvas.getActiveObject();
		if (tempObj) {
			this.currentActiveObject = tempObj;
		}
		if (this.currentActiveObject) {
			if (this.currentActiveObject.type == this.imageComonent.type) {
				if (this.imageComonent.parentComponent) {
					this.imageComonent.parentComponent.classList.remove('d-none');
				}
				if (this.iTextComponent.parentComponent) {
					this.iTextComponent.parentComponent.classList.add('d-none')
				}
				this.updateObjectToImageComponent(this.currentActiveObject)
			}
			else if (this.currentActiveObject.type == this.iTextComponent.type) {
				if (this.imageComonent.parentComponent) {
					this.imageComonent.parentComponent.classList.add('d-none');
				}
				if (this.iTextComponent.parentComponent) {
					this.iTextComponent.parentComponent.classList.remove('d-none');
				}
				this.updateObjectToTextComponent(this.currentActiveObject);
			}

		}


	}
	clearEditor() {
		this.canvas.clear();
	}
	loadChildByData(dataChild, childControl) {
		this.children = [];
		dataChild.forEach(ch => {
			if (ch.type == IMAGE_COMPONENT) {
				this.addImage(ch.id, ch.data.src, ch.left, ch.top, ch.name, childControl, ch.data.scaleX, ch.data.scaleY)
			} else if (ch.type == ITEXT_COMPONENT) {
				this.addText(ch.id, ch.left, ch.top, ch.name, childControl,
					ch.data.text, ch.data.fontSize, ch.data.fontFamily, ch.data.textAlign, ch.data.fontWeight, ch.data.fontStyle, ch.data.underline, ch.data.scaleX, ch.data.scaleY);

			}
		});
	}
	//load data to editor
	load(jsonData, canControl = true) {
		this.clearEditor();
		let data = jsonData;
		console.log(data);
		this.init(data.parent.originalWidth, data.parent.originalHeight);
		this.addBackground(data.background.src);
		this.loadChildByData(data.child, canControl);



	}
	//save data from json 
	save() {
		let data = {
			parent: {
				left: this.parent.left,
				top: this.parent.top,
				fill: this.parent.fill,
				selectable: this.parent.selectable,
				stroke: this.parent.stroke,
				strokeWidth: this.parent.strokeWidth,
				originalHeight: this.parent.originalHeight,
				originalWidth: this.parent.originalWidth,
				height: this.parent.height,
				width: this.parent.width,
				angle: this.parent.angle,
				data: this.parent,

			},
			background: {
				left: this.background.left,
				top: this.background.top,
				scaleX: this.background.scaleX,
				scaleY: this.background.scaleY,
				selectable: false,
				data: this.background,

			},
			child: [],
		}
		this.children.forEach(e => {
			let ch = {
				type: e.type,
				left: e.left,
				top: e.top,
				id: e.id,
				selectable: e.selectable,
				name: e.name,
				data: e,
			}
			data.child.push(ch);
		});
		// console.log(JSON.stringify(data));
		return JSON.stringify(data);
	}
	download() {
		this.parent.set({ dirty: true });
		let tempZoom = this.canvas.getZoom();
		this.canvas.zoomToPoint({ x: this.canvas.width / 2, y: this.canvas.height / 2 }, 1);
		this.canvas.renderAll();
		var imgData = this.canvas.toDataURL({
			left: this.parent.left,
			top: this.parent.top,
			width: this.parent.width,
			height: this.parent.height,
		}
		);
		var doc = new jsPDF('p', 'mm', 'a4');
		if (!doc) {
			console.error("please include jsPDF for  download as pdf link :  https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js")
		}
		var width = doc.internal.pageSize.getWidth();
		var height = doc.internal.pageSize.getHeight();
		doc.addImage(imgData, 'PNG', 0, 0, width, height);
		doc.save('sample-file.pdf');
		this.canvas.zoomToPoint({ x: this.canvas.width / 2, y: this.canvas.height / 2 }, tempZoom);

	}
	generateChildObject() {
		if (!this.elmentInspektor) {
			console.error("inspektor element not found please set id inpsekor element");
			return;
		}
		this.elmentInspektor.innerHTML = "";
		this.children.forEach((child, i) => {
			let isActive = false;
			if (this.currentActiveObject) {
				if (this.currentActiveObject.id == child.id) {
					isActive = true;
				}

			}
			let activeClass = (!isActive) ? "d-none" : "";
			let activeColorClass = (!isActive) ? "btn-secondary" : "btn-success";
			let btnGroup = document.createElement("div");
			btnGroup.setAttribute("id", "child-object-" + child.id);
			btnGroup.setAttribute("class", "btn-group mb-2");
			let btnClick = document.createElement("button");
			btnClick.setAttribute("id", "child-object-click-" + child.id)
			btnClick.setAttribute("class", "btn " + activeColorClass)
			btnClick.setAttribute("data-id", child.id)
			btnClick.onclick = function (e) { this.childClick(e) }.bind(this);
			btnClick.appendChild(document.createTextNode(child.name));
			btnGroup.appendChild(btnClick)
			let btnClose = document.createElement("button");
			btnClose.setAttribute("id", "child-object-close-" + child.id);
			btnClose.setAttribute("data-id", child.id);
			btnClose.setAttribute("class", "btn btn-danger " + activeClass);
			btnClose.onclick = function (e) { this.childCloseClick(e) }.bind(this);
			btnClose.appendChild(document.createTextNode("x"));
			btnGroup.appendChild(btnClose)
			this.elmentInspektor.appendChild(btnGroup);
		});
	}
	generateId(type) {
		return `${type}-${Math.random().toString(36).substr(2, 9)}`;
	}
	childClick(e) {
		let dataID = e.target.dataset.id;
		this.activeChildObject(dataID);
		this.generateChildObject();
	}
	childCloseClick(e) {
		let dataID = e.target.dataset.id;
		this.removeChildObject(dataID);

	}
	findChildObject(id) {
		return this.children.find(c => c.id == id);
	}
	findChildObjectByName(name) {
		return this.children.find(c => c.name == name);
	}

	removeChildObject(id) {
		let ch = this.findChildObject(id);
		if (ch) {
			let index = this.children.indexOf(ch);
			if (index > -1) {
				this.children.splice(index, 1);
				this.canvas.remove(ch);
			}

		}
	}
	activeChildObject(id) {
		let ch = this.findChildObject(id)
		if (ch) {
			this.currentActiveObject = ch;
			this.canvas.discardActiveObject();
			this.canvas.setActiveObject(ch);
			this.canvas.requestRenderAll();
		}
	}


}
