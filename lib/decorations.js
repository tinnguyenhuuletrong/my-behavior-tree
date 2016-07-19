"use strict";
var Utils = require("./utils.js")
const EBehaviorReturnCode = Utils.EBehaviorReturnCode
const BehaviorComponent = Utils.BehaviorComponent

/// <summary>
/// Check Conditional and excute child behavior
/// call external callback to perform condition checking
///	Return Failure in case condition not satify
/// Return Forward resulted of child behavior 
///	Return Success in case child behavior not set
/// </summary>
/// <param name="condition">callback condition evaluate (dt, scope : object) as arguments and return true or false</param>
class Condition extends BehaviorComponent {
	constructor(condition) {
		super()
		this.callback = condition || Utils.NullCallback
	}

	setCondition(condition) {
		this.callback = condition || Utils.NullCallback
	}

	add(behavior) {
		this._behavior = behavior
	}

	behave(dt, scope) {
		super.behave(dt, scope)

		var res = this.callback(dt, scope)

		if (!res)
			return this.ReturnCode = EBehaviorReturnCode.Failure

		if (this._behavior === null)
			return this.ReturnCode = EBehaviorReturnCode.Success

		return this._behavior.behave(dt, scope)
	}
}


/// <summary>
/// executes the behavior after a given amount of time in miliseconds has passed
///	Return Running in case not time up
/// Return Forward resulted of child behavior 
///	Return Success in case child behavior not set
/// </summary>
/// <param name="timeToWait">maximum time to wait before executing behavior</param>
/// <param name="behavior">behavior to run</param>
class Timer extends BehaviorComponent {
	constructor(timeToWait) {
		super()
		this.timeToWait = timeToWait
		this.timer = 0
	}

	setWaitingTime(timeToWait) {
		this.timeToWait = timeToWait
	}

	add(behavior) {
		this._behavior = behavior
	}

	behave(dt, scope) {
		super.behave(dt, scope)

		this.timer += dt

		var res = this.timer >= this.timeToWait

		if (!res)
			return this.ReturnCode = EBehaviorReturnCode.Running

		this.timer = 0

		if (this._behavior === null)
			return this.ReturnCode = EBehaviorReturnCode.Success

		return this._behavior.behave(dt, scope)
	}
}

exports.Condition = Condition
exports.Timer = Timer