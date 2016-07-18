var assert = require('chai').assert;
var Utils = require("../lib/utils.js")
var behavior = require("../lib/behavior")
var Composites = behavior.Composites
var Actions = behavior.Actions

var BasicAction = Actions.BasicAction
var AsyncAction = Actions.AsyncAction

var BehaviorComponent = Utils.BehaviorComponent
const EBehaviorReturnCode = Utils.EBehaviorReturnCode

describe('+ actions', function() {

	describe('- Basic action (synchonous action)', function() {

		it('perform one shot action', function() {
			var firstItem = new BasicAction()
			var scope = {}

			firstItem.setAction((dt, scope) => {
				scope.hit = true
				return EBehaviorReturnCode.Success
			})

			var ins = new behavior.Behavior(firstItem)

			while (ins.behave(1, scope) == EBehaviorReturnCode.Running) {}

			assert.equal(ins.ReturnCode, EBehaviorReturnCode.Success)
			assert.equal(scope.hit, true)
		});

		it('perform long running action', function() {
			var firstItem = new BasicAction()
			var scope = {
				delay: 5,
				count: 0
			}

			firstItem.setAction((dt, scope) => {
				scope.delay -= dt
				scope.count += 1
				if (scope.delay > 0)
					return EBehaviorReturnCode.Running
				else
					return EBehaviorReturnCode.Success
			})

			var ins = new behavior.Behavior(firstItem)

			while (ins.behave(1, scope) == EBehaviorReturnCode.Running) {}

			assert.equal(ins.ReturnCode, EBehaviorReturnCode.Success)
			assert.equal(scope.delay, 0)
			assert.equal(scope.count, 5)
		});

		it('perform acsync action', function(done) {
			var firstItem = new AsyncAction()
			var scope = {
				hit: false
			}

			firstItem.setAction((dt, scope, doneCallback) => {
				setTimeout(function() {
					scope.hit = true
					doneCallback(null, "hello")

					ins.behave(1, scope)
					assert.equal(ins.ReturnCode, EBehaviorReturnCode.Success)
					assert.equal(scope.hit, true)
					done()

				}, 100);
			})

			var ins = new behavior.Behavior(firstItem)
			
			ins.behave(1, scope)
		});
	});
});