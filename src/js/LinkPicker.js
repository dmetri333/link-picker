import Util from '@foragefox/page-builder-util';

class LinkPicker {
	
	constructor(options) {
		this.options = $.extend(true, {}, LinkPicker.DEFAULTS, typeof options == 'object' && options); 
		
		this.$body = $('body');
		
		this.init();		
	}

	init() {
		this.initModal();
		this.bindEvents();
	}
	
	initModal() {
		var linkForm = Util.supplant(this.options.templates.linkForm);
		var modal = Util.supplant(this.options.templates.modal, { linkForm: linkForm });

		this.$element = $(this.options.templates.container);
		this.$element.append(modal);
		
		this.$body.append(this.$element);
	}
	
	bindEvents() {
		this.$element.on('click', '[data-action=close]', this.close.bind(this));
		this.$element.on('click', '[data-action=add-link]', this.addLink.bind(this));
	}
	
	open() {
		//this.populateLinkList();
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

}


LinkPicker.DEFAULTS = {
	endpoint: '',
	selectCallback: function(result) {},
	templates: {
		container: `<div class="link-picker fade"></div>`,
		linkItem: `
			<li class="link-item">
				<input type="hidden" class="item-permalink" value="{{url}}">
				<span class="item-title">{{title}}</span>
				<span class="item-info">{{info}}</span>
			</li>
			`,
		modal: `
			<div class="link-picker-dialog">
				<div class="link-picker-content">

					<div class="link-picker-header">
						<button data-action="close" type="button" class="close" aria-label="Close"><i class="lp-icon-close"></i></button>
						<h3>Insert/edit link</h3>
					</div>
				
					<div class="link-picker-body">
						{{linkForm}}
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
	}
}

export default LinkPicker;
