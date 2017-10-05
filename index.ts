import * as uuidv4 from 'uuid/v4';

interface Events {
    [key: string]: any;
}

module.exports =  class ExpressData {

    verbose: boolean;
    onEndRequest: any;

    constructor(config?: any) {
        this.verbose = config ? config.verbose || false : false;
        this.onEndRequest = config ? config.onEndRequest || false : false;
    }

    private timeElapsed(startTime: any, endTime: any) {
        if(!startTime || !endTime) {
            return 0;
        }
        return ((endTime[0] - startTime[0]) * 1e3 + (endTime[1] - startTime[1]) * 1e-6);
    }

    interceptor(req: any, res: any, next: any) {

        let events: Events = {
            uuid: uuidv4(),
            url: req.url,
            method: req.method,
            startTime: process.hrtime()
        }

        let warnNull = (name: string) => console.warn(`An event with name ${name} has NOT been created. Use the record method to created it.`);

        let warnExists = (name: string) => console.warn(`An event with name ${name} has already been created.`);

        let init = (name: string) => {
            if (!events[name]) {
                events[name] = {};
            } else {
                warnExists(name);
            }
        }

        let record = (name: string) => {
            init(name);
            events[name].startTime = process.hrtime();
        }

        let stop = (name: string) => {
            if(!events[name]) {
                warnNull(name);
            } else {
                events[name].stopTime = process.hrtime();
                events[name].timeElapsed = this.timeElapsed(events[name].startTime, events[name].stopTime);
            }
            if (this.verbose) {
                logEvent(name);
            }
        }

        let endRequest = (cb?: any) => {
            events.stopTime = process.hrtime();
            events.timeElapsed = this.timeElapsed(events.startTime, events.stopTime);
            this.onEndRequest ? this.onEndRequest(req) : null;
            cb ? cb() : null;
        }

        let logEvent = (name: string) => console.info(`${name}: (${events[name].timeElapsed}ms)`);

        let getData = () => events;

        req.expressData = {
            record,
            stop,
            endRequest,
            logEvent,
            getData
        }

        next();

    }

}