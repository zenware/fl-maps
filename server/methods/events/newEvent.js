import { Meteor } from 'meteor/meteor'
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import Events, { EventsSchema } from '/imports/both/collections/events'
import { logRateLimit } from '/server/security/rate-limiter'

const name = 'Events.newEvent'
const newEvent = new ValidatedMethod({
  name,
  mixins: [],
  validate: EventsSchema.validator(),
  run (event) {
    if (!Meteor.user()) {
      throw new Meteor.Error('Events.newEvent', 'Only users can perform this task')
    }

    return Events.insert(event, { validate: false, filter: false })
  }
})
  
DDPRateLimiter.addRule({
  name,
  type: 'method'
}, 2, 10000, ({ allowed }, { userId, clientAddress }) => { // 2 requests every 10 seconds
  if (!allowed) {
    logRateLimit(name, userId, clientAddress)
  }
})
