"use strict";
var Utils = require("./utils.js")
var Composites = require("./composites.js")
var Actions = require("./action.js")
var Decorations = require("./decorations.js")

const EBehaviorReturnCode = Utils.EBehaviorReturnCode

class JBehavior {
	constructor(root) {
		this.Root = root;
		this.ReturnCode = EBehaviorReturnCode.Failure;
	}

	behave(dt, scope) {
		if (this.Root == null) {
			this.ReturnCode = EBehaviorReturnCode.Failure;
			return this.ReturnCode
		}
		scope = scope || {}
		try {
			this.ReturnCode = this.Root.behave(dt, scope)
			return this.ReturnCode
		} catch (ex) {
			console.error(ex)
			this.ReturnCode = EBehaviorReturnCode.Failure;
			return this.ReturnCode
		}

	}
}

exports.Behavior = JBehavior
exports.Composites = Composites
exports.Actions = Actions
exports.Decorations = Decorations