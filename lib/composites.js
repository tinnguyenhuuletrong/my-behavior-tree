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

	_internal_behave(dt, scope) {
		super.behave(dt, scope)
	}

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		for (var i = 0; i < this.ListBehavior.length; i++) {
			var itm = this.ListBehavior[i]
			var res = itm.behave(dt, scope)
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
/// AND-logic attempts to run the behaviors all in one cycle
/// -Returns Success when all are successful
/// -Returns Failure if one behavior fails or an error occurs
/// -Returns Running if any are running
/// </summary>
/// <param name="behaviors"></param>
class Sequence extends Selector {
	constructor(behaviors) {
		super(behaviors)
	}

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		var anyRunning = false
		for (var i = 0; i < this.ListBehavior.length; i++) {
			var itm = this.ListBehavior[i]

			var res = itm.behave(dt, scope)
			if (res == EBehaviorReturnCode.Failure) {
				this.ReturnCode = EBehaviorReturnCode.Failure
				return this.ReturnCode
			} else if (res == EBehaviorReturnCode.Running) {
				anyRunning = true
				continue
			} else
				continue
		}

		if (anyRunning)
			this.ReturnCode = EBehaviorReturnCode.Running
		else
			this.ReturnCode = EBehaviorReturnCode.Success

		return this.ReturnCode
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

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		var item = Utils.RandomInArray(this.ListBehavior)
		var res = item.behave(dt, scope)

		this.ReturnCode = res
		return this.ReturnCode
	}
}

/// <summary>
/// The selector for the root node of the behavior tree
/// -Returns Success if selected behavior returns Success
/// -Returns Failure if selected behavior returns Failure
/// -Returns Running if selected behavior returns Running
/// </summary>
/// <param name="indexSelectorCallback">an callback return index representing which of the behavior branches to perform</param>
/// <param name="behaviors">the behavior branches to be selected from</param>
class IndexSelector extends Selector {
	constructor(behaviors, indexSelectorCallback) {
		super(behaviors)
		this.indexSelectorCallback = indexSelectorCallback || this._defaultIndexSelect
	}

	_defaultIndexSelect(scope) {
		return 0
	}

	setSelectorCallback(callback) {
		this.indexSelectorCallback = callback || this._defaultIndexSelect
	}

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		var index = this.indexSelectorCallback(scope)
		var item = this.ListBehavior[index]
		var res = item.behave(dt, scope)

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

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		var length = this.ListBehavior.length

		while (this._index < length) {
			var itm = this.ListBehavior[this._index]
			var res = itm.behave(dt, scope)

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

/// <summary>
/// attempts to run the behaviors all in one cycle (start from last remembered position)
/// -Returns Success when all are successful
/// -Returns Failure if one behavior fails or an error occurs. reset remembered position
/// -Return Running. Begin evaluating at remembered position next cycle
/// </summary>
/// <param name="behaviors"></param>
class StatefulSequence extends Selector {
	constructor(behaviors) {
		super(behaviors)
		this._index = 0
	}

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		var length = this.ListBehavior.length
		for (; this._index < length; this._index++) {
			var itm = this.ListBehavior[this._index]
			var res = itm.behave(dt, scope)

			if (res == EBehaviorReturnCode.Success)
				continue
			else if (res == EBehaviorReturnCode.Running) {
				this.ReturnCode = EBehaviorReturnCode.Running
				return this.ReturnCode
			}

			//Failure. Reset index
			this._index = 0
			this.ReturnCode = EBehaviorReturnCode.Failure;
			return this.ReturnCode;
		}

		//All success. Reset index
		this._index = 0
		this.ReturnCode = EBehaviorReturnCode.Success;
		return this.ReturnCode;
	}
}

/// <summary>
/// Selects among the given behavior components (start from last remembered position) 
/// Performs an OR-Like behavior and will "fail-over" to each successive component until Success is reached or Failure is certain
/// -Returns Success if a behavior component returns Success reset last remembered position
/// -Returns Running if a behavior component returns Running.  Begin evaluating at remembered position next cycle
/// -Returns Failure if all behavior components returned Failure 
/// </summary>
/// <param name="behaviors">one to many behavior components</param>
class StatefulSelector extends Selector {
	constructor(behaviors) {
		super(behaviors)
		this._index = 0
	}

	behave(dt, scope) {
		this._internal_behave(dt, scope)

		var length = this.ListBehavior.length
		for (; this._index < length; this._index++) {
			var itm = this.ListBehavior[this._index]
			var res = itm.behave(dt, scope)

			if (res == EBehaviorReturnCode.Failure)
				continue
			else if (res == EBehaviorReturnCode.Running) {
				this.ReturnCode = EBehaviorReturnCode.Running
				return this.ReturnCode
			}

			//Failure. Reset index
			this._index = 0
			this.ReturnCode = EBehaviorReturnCode.Success;
			return this.ReturnCode;
		}

		//All success. Reset index
		this._index = 0
		this.ReturnCode = EBehaviorReturnCode.Failure;
		return this.ReturnCode;
	}
}


exports.Selector = Selector
exports.RandomSelector = RandomSelector
exports.IndexSelector = IndexSelector
exports.PartialSelector = PartialSelector
exports.Sequence = Sequence
exports.StatefulSequence = StatefulSequence
exports.StatefulSelector = StatefulSelector