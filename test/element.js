import frontEndCore from './../index.js'

class MyElement extends frontEndCore.Element {
	brojack () {
		return 'yup'
	}
}

window.myElement = new MyElement({
	renderTo: document.body,
	className: 'bro jack rick',
	innerHTML: `
	<div class="bob" style="width: 100px; outline: 1px solid #000;">
		<div data-yup="meh" style="width:50px;height: 50px; background: #f0f;">
			help
		</div>
	</div>
	<div class="bobka">
		<div data-yup="meho" style="width:50px;height: 50px; background: #f0f;">
			help
		</div>
	</div>
	`
})

window.myElement.on('click', (e) => {
	console.log (e.getTarget('.bob'),e.getTarget('[data-yup="meho"]'))
})
