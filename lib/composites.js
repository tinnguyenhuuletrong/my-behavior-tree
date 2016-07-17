"use strict";
var Utils = require("./utils.js")
const EBehaviorReturnCode = Utils.EBehaviorReturnCode
const BehaviorComponent = Utils.BehaviorComponent

/// <summary>
/// Selects among the given behavior components
/// Performs an OR-Like behavior and will "fail-over" to each successive component until Success is reached or Failure is certain
/// -Returns Success if a behavior component returns Success
/// -Returns Running if a behavior component returns Running
/// -Returns Failure if all behavior components returned Failure
/// </summary>
/// <param name="behaviors">one to many behavior components</param>
class Selector extends BehaviorComponent {
	constructor(behaviors) {
		super()
		this.ListBehavior = behaviors || []
	}

	add(behavior) {
		this.ListBehavior.push(behavior)
	}

	behave(dt) {
		super.behave(dt)
		for (var i = 0; i < this.ListBehavior.length; i++) {
			var itm = this.ListBehavior[i]
			var res = itm.behave()
			if (res == EBehaviorReturnCode.Failure) {
				continue;
			}

			this.ReturnCode = res
			return this.ReturnCode
		}

		this.ReturnCode = EBehaviorReturnCode.Failure
		return EBehaviorReturnCode.Failure
	}
}


/// <summary>
/// Randomly selects and performs one of the passed behaviors
/// -Returns Success if selected behavior returns Success
/// -Returns Failure if selected behavior returns Failure
/// -Returns Running if selected behavior returns Running
/// </summary>
/// <param name="behaviors">one to many behavior components</param>
class RandomSelector extends Selector {
	constructor(behaviors) {
		super(behaviors)
	}

	behave(dt) {
		var item = Utils.RandomInArray(this.ListBehavior)
		var res = item.behave(dt)

		this.ReturnCode = res
		return this.ReturnCode
	}
}

/// <summary>
/// Selects among the given behavior components (one evaluation per Behave call)
/// Performs an OR-Like behavior and will "fail-over" to each successive component until Success is reached or Failure is certain
/// -Returns Success if a behavior component returns Success
/// -Returns Running if a behavior component returns Failure or Running
/// -Returns Failure if all behavior components returned Failure or an error has occured
/// </summary>
/// <param name="behaviors">one to many behavior components</param>
class PartialSelector extends Selector {
	constructor(behaviors) {
		super(behaviors)
		this._index = 0
	}

	behave(dt) {
		var length = this.ListBehavior.length

		while (this._index < length) {
			var itm = this.ListBehavior[this._index]
			var res = itm.behave(dt)

			if (res == EBehaviorReturnCode.Success) {
				this._index = 0
				this.ReturnCode = res
				return res
			}

			this._index++;
			this.ReturnCode = EBehaviorReturnCode.Running
			return this.ReturnCode
		}

		this._index = 0
		this.ReturnCode = EBehaviorReturnCode.Failure
		return this.ReturnCode
	}
}

exports.Selector = Selector
exports.RandomSelector = RandomSelector
exports.PartialSelector = PartialSelector