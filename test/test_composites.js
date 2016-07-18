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
			assert.notEqual(selected, -1)
		});
	});

	describe('- index selector - The selector for the root node of the behavior tree', function() {
		it('should select corresponding cycle count', function() {
			var selector = new Composites.IndexSelector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = -1
			var cycle = 0

			firstItem.behave = (dt) => {
				selected = 1
				return EBehaviorReturnCode.Success
			}

			secondItem.behave = (dt) => {
				selected = 2
				return EBehaviorReturnCode.Running
			}

			selector.setSelectorCallback(() => {
				return cycle % 2
			})

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			var res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Success)
			assert.equal(selected, 1)

			cycle++;
			res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Running)
			assert.equal(selected, 2)
		});
	});

	describe('- parital selector - Selects among the given behavior components (one evaluation per Behave call) ', function() {
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

	describe('- stateful selector - OR-logic Selects among the given behavior components (start from last remembered position) ', function() {
		it('returns Success if a behavior component returns Success reset last remembered position', function() {
			var selector = new Composites.StatefulSelector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = ""
			var cycle = 0

			firstItem.behave = (dt) => {
				selected += ("1" + cycle.toString())
				return firstItem.ReturnCode
			}

			secondItem.behave = (dt) => {
				selected += ("2" + cycle.toString())
				return secondItem.ReturnCode
			}

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			//1st Run
			firstItem.ReturnCode = EBehaviorReturnCode.Failure
			secondItem.ReturnCode = EBehaviorReturnCode.Success

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Success)
			assert.equal(selected, "1020")

			//2nd Run
			firstItem.ReturnCode = EBehaviorReturnCode.Success
			secondItem.ReturnCode = EBehaviorReturnCode.Failure

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Success)
			assert.equal(selected, "102011")
		});

		it('returns Running if a behavior component returns Running.  Begin evaluating at remembered position next cycle', function() {
			var selector = new Composites.StatefulSelector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = ""
			var cycle = 0

			firstItem.behave = (dt) => {
				selected += ("1" + cycle.toString())
				return firstItem.ReturnCode
			}

			secondItem.behave = (dt) => {
				selected += ("2" + cycle.toString())
				return secondItem.ReturnCode
			}

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			//1st Run
			firstItem.ReturnCode = EBehaviorReturnCode.Failure
			secondItem.ReturnCode = EBehaviorReturnCode.Running

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Running)
			assert.equal(selected, "1020")

			//2nd Run
			firstItem.ReturnCode = EBehaviorReturnCode.Success
			secondItem.ReturnCode = EBehaviorReturnCode.Success

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Success)
			assert.equal(selected, "102021")
		});

		it('Returns Failure if all behavior components returned Failure ', function() {
			var selector = new Composites.StatefulSelector()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = ""
			var cycle = 0

			firstItem.behave = (dt) => {
				selected += ("1" + cycle.toString())
				return firstItem.ReturnCode
			}

			secondItem.behave = (dt) => {
				selected += ("2" + cycle.toString())
				return secondItem.ReturnCode
			}

			selector.add(firstItem)
			selector.add(secondItem)

			var ins = new behavior.Behavior(selector)

			//1st Run
			firstItem.ReturnCode = EBehaviorReturnCode.Failure
			secondItem.ReturnCode = EBehaviorReturnCode.Failure

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Failure)
			assert.equal(selected, "1020")
		});
	});

	describe('- sequence - AND-logic attempts to run the behaviors all in one cycle', function() {
		it('returns Success when all behavior component returns Success', function() {
			var selector = new Composites.Sequence()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = -1
			var numRun = 0

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

			res = ins.behave(1)
			assert.equal(res, EBehaviorReturnCode.Success)

			assert.equal(selected, 2)
		});

		it('returns Failure if one behavior fails or an error occurs', function() {
			var selector = new Composites.Sequence()
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
			assert.equal(res, EBehaviorReturnCode.Failure)

			assert.equal(selected, 1)
		});

		it('returns Running if any are running', function() {
			var selector = new Composites.Sequence()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = -1
			var numRun = 0

			firstItem.behave = (dt) => {
				selected = 1
				return EBehaviorReturnCode.Running
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

			assert.equal(selected, 2)
		});
	});

	describe('- stateful sequence - AND-logic attempts to run the behaviors all in one cycle (remembered last cycle position)', function() {
		it('returns Success when all behavior component returns Success', function() {
			var selector = new Composites.StatefulSequence()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = -1
			var cycle = 0

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

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Success)

			assert.equal(selected, 2)
			assert.equal(cycle, 1)
		});

		it('return Running. Next cycle begin evaluating from remembered position ', function() {
			var selector = new Composites.StatefulSequence()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = ""
			var cycle = 0

			firstItem.behave = (dt) => {
				selected += ("1" + cycle.toString())
				return EBehaviorReturnCode.Success
			}

			secondItem.behave = (dt) => {
				selected += ("2" + cycle.toString())
				return secondItem.ReturnCode
			}

			selector.add(firstItem)
			selector.add(secondItem)
			var ins = new behavior.Behavior(selector)

			//Running now
			secondItem.ReturnCode = EBehaviorReturnCode.Running

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Running)
			assert.equal(selected, "1020")

			//Success now
			secondItem.ReturnCode = EBehaviorReturnCode.Success

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Success)
			assert.equal(selected, "102021")

		});

		it('-returns Failure if one behavior fails or an error occurs. reset remembered position', function() {
			var selector = new Composites.StatefulSequence()
			var firstItem = new BehaviorComponent()
			var secondItem = new BehaviorComponent()
			var selected = ""
			var cycle = 0

			firstItem.behave = (dt) => {
				selected += ("1" + cycle.toString())
				return firstItem.ReturnCode
			}

			secondItem.behave = (dt) => {
				selected += ("2" + cycle.toString())
				return secondItem.ReturnCode
			}

			selector.add(firstItem)
			selector.add(secondItem)
			var ins = new behavior.Behavior(selector)

			//Failure now
			firstItem.ReturnCode = EBehaviorReturnCode.Success
			secondItem.ReturnCode = EBehaviorReturnCode.Failure

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Failure)
			assert.equal(selected, "1020")

			//Running now
			firstItem.ReturnCode = EBehaviorReturnCode.Success
			secondItem.ReturnCode = EBehaviorReturnCode.Running

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Running)
			assert.equal(selected, "10201121")

			//Success now
			firstItem.ReturnCode = EBehaviorReturnCode.Success
			secondItem.ReturnCode = EBehaviorReturnCode.Success

			res = ins.behave(1)
			cycle++;
			assert.equal(res, EBehaviorReturnCode.Success)
			assert.equal(selected, "1020112122")
		});
	});

});