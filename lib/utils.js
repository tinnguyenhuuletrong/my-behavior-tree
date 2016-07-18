"use strict";
const EventEmitter = require('events');

//---------------------------------------------------------------------//
// Behavior base class
//---------------------------------------------------------------------//

var EBehaviorReturnCode = {
	Failure: 0,
	Success: 1,
	Running: 2
}

class BehaviorComponent {
	constructor() {
		this.ReturnCode = EBehaviorReturnCode.Failure
		this.NodeData = null
	}

	behave(dt, scope) {
		return this.ReturnCode
	}

	getNodeData() {
		return this.NodeData
	}

	setNodeData(data) {
		this.NodeData = data
	}

	getMetaData() {
		return this.NodeData.InfoData || {}
	}
}

exports.EBehaviorReturnCode = EBehaviorReturnCode
exports.BehaviorComponent = BehaviorComponent

//---------------------------------------------------------------------//
// Utils
//---------------------------------------------------------------------//
function RandomInArray(items) {
	var item = items[Math.floor(Math.random() * items.length)];
	return item
}
exports.RandomInArray = RandomInArray