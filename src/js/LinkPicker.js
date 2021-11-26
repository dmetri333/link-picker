import { extend, supplant, append, findOne, find, on, remove, parseForm, populateForm, empty } from '@foragefox/doubledash';

class LinkPicker {
	
	constructor(options) {
		this.options = extend(true, LinkPicker.DEFAULTS, typeof options == 'object' && options);
		
		this.initModal();
		this.bindEvents();
		this.populate();
	}
	
	initModal() {
		let modal = supplant(this.options.templates.modal, {
			linkForm: this.options.templates.linkForm,
			existingContent: (this.options.enableExistingContent ? this.options.templates.existingContent : '')
		});

		this.element = append(modal, document.body);

		this.contentList = findOne('.results-list-content ul', this.element);
		this.sectionList = findOne('.results-list-section ul', this.element);
		this.linkForm = findOne('.link-form', this.element);
	}
	
	bindEvents() {
		on(this.element, 'click', '[data-action=close]', () => this.close());
		on(this.element, 'click', '[data-action=add-link]', () => this.addLink());
		on(this.element, 'input', '[data-action=search-content]', (event) => this.populateContent(event));
		on(this.element, 'click', '[data-action=select-link]', (event) => this.selectLink(event));
	}
	
	open() {
		this.populateSection();

		this.element.classList.add('open');
		
		this.options.onOpen();
	}
	
	close() {
		remove(this.element);

		this.options.onClose();
	}
	
	addLink() {
		var result = parseForm(this.linkForm);
		this.options.onSelect(result) 
		this.close();
	}

	populate() {
		if (this.options.link.url) {
			populateForm(this.linkForm, this.options.link);
		}
	}

	selectLink(event) {
		let item = event.delegateTarget;
	
		let link = { text: item.dataset.text, url: item.dataset.url };

		populateForm(this.linkForm, link);
	}

	populateContent(event) {
		let value = event.target.value;
		
		empty(this.contentList);
		
		if (value.length < 3) {
			return;
		}

		fetch(this.options.endpoint + '?' + new URLSearchParams({q: value}), {
				headers: {
					'Accept': 'application/json'
				}
			})
			.then(this.responseHandler)
			.then(data => {
				let html = '';
				for (let i = 0; i < data.length; i++) {
					data[i].tab = 'content';
					
					let link = this.options.mapData(data[i]);
					
					html += supplant(this.options.templates.existingContentItem, link);
				}

				this.contentList.innerHTML = html;
			})
			.catch((error) => {
				console.error('Error: ', error);
			});
	}

	populateSection() {
		if (!this.sectionList) return;

		empty(this.sectionList);
		
		let html = '';
		let sections = find('[data-structure=container]');
		for (let i = 0; i < sections.length; i++) {
			html += supplant(this.options.templates.existingContentItem, { 
				text: 'Container ' + i,
				url: '#'+sections[i].id,
				tab: 'section'
			});
		}

		this.sectionList.innerHTML = html;
	}

	responseHandler(response) {

		if (!response.ok) {
			return Promise.reject(response.statusText);
		}
	
		return response.text().then(text => {
			const data = text && JSON.parse(text);

			if (data && data.error && data.error.status) {
				return Promise.reject(data.error.message);
			}

			if (data && data.status && data.status.error) {
				return Promise.reject(data.status.message);
			}
	
			return data.data ? data.data : data.payload;
		});
	
	}
}


LinkPicker.DEFAULTS = {
	endpoint: '',	
	link: {},
	enableExistingContent: false,
	mapData: function(data) { return data; },
	onSelect: function(result) { },
	onOpen: function() { },
	onClose: function() { },
	templates: {
		modal: `
			<div class="link-picker">
				<div class="link-picker-dialog">
					<div class="link-picker-content">

						<div class="link-picker-header">
							<button data-action="close" type="button" class="close" aria-label="Close"><i class="lp-icon-close"></i></button>
							<h3>Insert/edit link</h3>
						</div>
					
						<div class="link-picker-body">
							{{& linkForm}}
							{{& existingContent}}
						</div>

						<div class="link-picker-footer">
							<button data-action="close" class="btn btn-link">Cancel</button>
							<button data-action="add-link" class="btn btn-primary">Add Link</button>
						</div>

					</div>
				</div>
			</div>	
		`,
		linkForm: `
			<div class="link-form">
				<p><i>Enter the destination URL</i></p>
				<div class="form-group row">
					<label for="url" class="col-sm-2 col-form-label">URL</label>
					<div class="col-sm-10">
						<input type="text" class="form-control" name="url" id="url" autocomplete="off" />
					</div>
				</div>
				
				<div class="form-group row">
					<label for="text" class="col-sm-2 col-form-label">Text</label>
					<div class="col-sm-10">
						<input type="text" class="form-control" name="text" id="text" autocomplete="off" />
					</div>
				</div>
				
				<div class="form-group row">
					<div class="offset-md-2 col-sm-10">
						<div class="form-check">
							<input class="form-check-input" type="checkbox" value="_blank" name="targetBlank" id="targetBlank" />
							<label class="form-check-label" for="targetBlank">
								Open link in a new tab
							</label>
						</div>
					</div>
				</div>
			</div>
		`,
		existingContent: `
			<div class="existing-content">

				<p><i>Or link to existing content</i></p>

				<ul class="nav nav-tabs nav-fill">
					<li class="nav-item">
						<a class="nav-link active" href="#lp-content" data-toggle="tab">Content</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#lp-section" data-toggle="tab">Section</a>
					</li>
					<li class="nav-item">
						<a class="nav-link disabled" href="#lp-modals" tabindex="-1" aria-disabled="true" data-toggle="tab">Modals</a>
					</li>
				</ul>

				<div class="tab-content">
					<div class="tab-pane fade show active" id="lp-content" role="tabpanel" aria-labelledby="home-tab">
						<div class="results-list results-list-content">
							<input class="form-control" data-action="search-content" value="" placeholder="search links..." />
							<ul></ul>
						</div>
					</div>
					<div class="tab-pane fade" id="lp-section" role="tabpanel" aria-labelledby="profile-tab">
						<div class="results-list results-list-section">
							<ul></ul>
						</div>
					</div>
				</div>

				
			</div>
		`,
		existingContentItem: `	<li class="text-truncate" data-action="select-link" data-text="{{text}}" data-url="{{url}}">
									{{text}}  <em class="text-muted small">{{url}}</em>
								</li>`
	}
}

export default LinkPicker;
