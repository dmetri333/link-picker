import Util from '@foragefox/page-builder-util';

class LinkPicker {
	
	constructor(options) {
		this.options = $.extend(true, {}, LinkPicker.DEFAULTS, typeof options == 'object' && options); 
		
		this.$body = $('body');
		
		this.initModal();
		this.bindEvents();
		this.populate();
	}
	
	initModal() {
		var linkForm = Util.supplant(this.options.templates.linkForm);
		var existingContent = this.options.enableExistingContent ? Util.supplant(this.options.templates.existingContent) : '';
		var modal = Util.supplant(this.options.templates.modal, { linkForm: linkForm, existingContent: existingContent });

		this.$element = $(this.options.templates.container);
		this.$element.append(modal);
		
		this.$body.append(this.$element);

		this.contentList = this.$element.find('.results-list-content ul');
		this.sectionList = this.$element.find('.results-list-section ul');
	}
	
	bindEvents() {
		this.$element.on('click', '[data-action=close]', this.close.bind(this));
		this.$element.on('click', '[data-action=add-link]', this.addLink.bind(this));
		this.$element.on('input', '[data-action=search-content]', this.populateContent.bind(this));
		this.$element.on('click', '[data-action=select-link]', this.selectLink.bind(this));
	}
	
	open() {
		this.populateSection();

		this.$element.show().addClass('open');
		$(document).off('focusin.modal');
	}
	
	close() {
		this.$element.remove();
	}
	
	addLink() {
		var result = Util.formToJSON(this.$element.find('.link-form'));
		this.options.selectCallback(result) 
		this.close();
	}

	populate() {
		if (this.options.link.url) {
			Util.formFromJSON(this.$element.find('.link-form'), this.options.link);
		}
	}

	selectLink(event) {
		let item = event.currentTarget;
		let link = { text: item.dataset.text, url: item.dataset.url };

		Util.formFromJSON(this.$element.find('.link-form'), link);
	}

	populateContent(event) {
		let value = event.currentTarget.value;
		
		this.contentList.empty();
		
		if (value.length < 3) {
			return;
		}

		$.ajax({
			cache: false,
			context: this,
			url: this.options.endpoint,
			data: { q: value },
			dataType: 'json',
			success: function (response) {
				
				let html = '';
				for (let i = 0; i < response.length; i++) {
					response[i].tab = 'content';
					
					let link = this.options.mapData(response[i]);
					
					html += Util.supplant(this.options.templates.existingContentItem, link);
				}

				this.contentList.html(html);
			},
			error: function (error) {
				console.log(error);
				
				throw error;
			},
		});

	}

	populateSection() {
		this.sectionList.empty();
		
		let html = '';
		$('[data-structure=container]').each(function(index, item) {
			html += Util.supplant(this.options.templates.existingContentItem, { 
				text: 'Container ' + index,
				url: '#'+item.id,
				tab: 'section'
			});
		}.bind(this));

		this.sectionList.html(html);
	}

}


LinkPicker.DEFAULTS = {
	endpoint: '',
	selectCallback: function(result) {},
	mapData: function(data) { return data; },
	link: {},
	enableExistingContent: false,
	templates: {
		container: `<div class="link-picker fade"></div>`,
		modal: `
			<div class="link-picker-dialog">
				<div class="link-picker-content">

					<div class="link-picker-header">
						<button data-action="close" type="button" class="close" aria-label="Close"><i class="lp-icon-close"></i></button>
						<h3>Insert/edit link</h3>
					</div>
				
					<div class="link-picker-body">
						{{linkForm}}
						{{existingContent}}
					</div>

					<div class="link-picker-footer">
						<button data-action="close" class="btn btn-link">Cancel</button>
						<button data-action="add-link" class="btn btn-primary">Add Link</button>
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
