var assert = require('chai').assert;
var Utils = require("../lib/utils.js")
var behavior = require("../lib/behavior")
var Composites = behavior.Composites
var BehaviorComponent = Utils.BehaviorComponent

const EBehaviorReturnCode = Utils.EBehaviorReturnCode

describe('+ composites', function() {
	describe('- selector - Performs an OR-Like behavior', function() {
		it('should first behavior', function() {
			var selector = new Composites.Selector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()

			var selected = -1
			secondItem.behave = (dt) => {
				selected = 2
				return EBehaviorReturnCode.Success
			}

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			var res = ins.behave(1)

			assert.equal(res, EBehaviorReturnCode.Success)
			assert.equal(selected, 2)
		});

		it('should failure', function() {
			var selector = new Composites.Selector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var thridItem = new BehaviorComponent()

			selector.add(firstItem)
			selector.add(secondItem)
			selector.add(thridItem)

			var ins = new behavior.Behavior(selector)

			var res = ins.behave(1)

			assert.equal(res, EBehaviorReturnCode.Failure)
		});
	});

	describe('- random selector - Randomly selects and performs one of the passed behaviors', function() {
		it('should return random value', function() {
			var selector = new Composites.RandomSelector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = -1

			firstItem.behave = (dt) => {

				selected = 1
				return EBehaviorReturnCode.Success
			}

			secondItem.behave = (dt) => {
				selected = 2
				return EBehaviorReturnCode.Success
			}

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			var res = ins.behave(1)

			assert.equal(res, EBehaviorReturnCode.Success)
			console.log("\trandomValue: ", selected)
			assert.notEqual(selected, -1)
		});
	});

	describe('- parital selector - Performs an OR-Like behavior only Failure when no-one Success', function() {
		it('returns Success if a behavior component returns Success', function() {
			var selector = new Composites.PartialSelector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = -1
			var numRun = 0

			firstItem.behave = (dt) => {
				selected = 1
				return EBehaviorReturnCode.Failure
			}

			secondItem.behave = (dt) => {
				selected = 2
				return EBehaviorReturnCode.Success
			}

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Running)

			res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Success)

			console.log("\tvalue: ", selected)
			assert.equal(selected, 2)
		});


		it('returns Failure if all behavior components returned Failure or an error has occured', function() {
			var selector = new Composites.PartialSelector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = -1
			var numRun = 0

			firstItem.behave = (dt) => {
				selected = 1
				return EBehaviorReturnCode.Failure
			}

			secondItem.behave = (dt) => {
				selected = 2
				return EBehaviorReturnCode.Failure
			}

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Running)

			res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Running)

			res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Failure)
		});
	});
});