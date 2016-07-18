var assert = require('chai').assert;
var Utils = require("../lib/utils.js")
var behavior = require("../lib/behavior")
var Composites = behavior.Composites
var Actions = behavior.Actions
var Decorations = behavior.Decorations

var BasicAction = Actions.BasicAction
var Condition = Decorations.Condition

var BehaviorComponent = Utils.BehaviorComponent
const EBehaviorReturnCode = Utils.EBehaviorReturnCode

describe('+ decorations', function() {

	describe('- condition. check conditional and excute child behavior', function() {
		it('waiting and run', function() {
			var condition = new Condition()
			var printAction = new BasicAction()
			var scope = {
				waiting: 5,
				hit: false
			}

			//Set basic condition
			condition.setCondition((dt, scope) => {
				scope.waiting--;

				if (scope.waiting > 0)
					return EBehaviorReturnCode.Failure
				else
					return EBehaviorReturnCode.Success
			})

			//Set hit action
			printAction.setAction((dt, scope) => {
				scope.hit = true
			})

			//link action and condition node
			condition.add(printAction)

			var ins = new behavior.Behavior(condition)

			while (!scope.hit) {
				ins.behave(1, scope)
			}

			assert.equal(ins.ReturnCode, EBehaviorReturnCode.Success)
			assert.equal(scope.hit, true)
			assert.equal(scope.waiting, 0)
		});
	});
});