"use strict";
var Utils = require("./utils.js")
const EBehaviorReturnCode = Utils.EBehaviorReturnCode
const BehaviorComponent = Utils.BehaviorComponent

/// <summary>
/// Perform BasicAction 
/// call external callback to perform synchonous action. 
/// -Returns Success if a callback return Success
/// -Returns Running if a callback return Running
/// -Returns Failure if callback return Failure or exception occured
/// </summary>
/// <param name="action">callback action update (dt, scope : object) as arguments</param>
class BasicAction extends BehaviorComponent {
	constructor(action) {
		super()
		this.callback = action || Utils.NullCallback
	}

	setAction(action) {
		this.callback = action || Utils.NullCallback
	}

	_internal_behave(dt, scope) {
		super.behave(dt, scope)
	}

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		var res = this.callback(dt, scope)

		if (res === null || res === undefined) {
			res = EBehaviorReturnCode.Success
		}

		this.ReturnCode = res
		return res
	}
}

/// <summary>
/// Perform AsyncAction 
/// call external callback to perform acsyn action. 
/// -Returns Success if a callback return Success
/// -Returns Running when waiting callback response
/// -Returns Failure if callback return Failure or exception occured
/// </summary>
/// <param name="action">callback action update (dt, scope : object, doneCallback(err, data)) as arguments</param>
class AsyncAction extends BehaviorComponent {
	constructor(action) {
		super()
		this.callback = action
		this.isReady = true
	}

	setAction(action) {
		this.callback = action
		this.reset()
	}

	reset() {
		this.isReady = true
		this.InfoData = null
	}

	_internal_behave(dt, scope) {
		super.behave(dt, scope)
	}

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		if (this.callback === null) {
			this.ReturnCode = EBehaviorReturnCode.Failure
			return this.ReturnCode
		}

		//Initial callback
		if (this.isReady) {
			this.isReady = false
			this.ReturnCode = EBehaviorReturnCode.Running
			this.callback(dt, scope, (err, data) => {
				//Update responding status
				if (err === null)
					this.ReturnCode = EBehaviorReturnCode.Success
				else
					this.ReturnCode = EBehaviorReturnCode.Failure

				//Store responding data
				this.InfoData = data
			})
		}
		//console.log("ret" , this.ReturnCode)
		return this.ReturnCode
	}
}

exports.BasicAction = BasicAction
exports.AsyncAction = AsyncAction