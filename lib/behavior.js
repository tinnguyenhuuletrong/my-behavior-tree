"use strict";
var Utils = require("./utils.js")
var Composites = require("./composites.js")
const EBehaviorReturnCode = Utils.EBehaviorReturnCode

class JBehavior {
	constructor(root) {
		this.Root = root;
		this.ReturnCode = EBehaviorReturnCode.Failure;
	}

	behave(dt) {
		if (this.Root == null) {
			this.ReturnCode = EBehaviorReturnCode.Failure;
			return this.ReturnCode
		}

		try {
			this.ReturnCode = this.Root.behave(dt)
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