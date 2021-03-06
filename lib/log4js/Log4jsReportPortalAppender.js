class Log4jsReportPortal {
  constructor(agent) {
    this.agent = agent;
    this.reportPortalAppender = this.reportPortalAppender.bind(this);
    this.configure = this.configure.bind(this);
  }
  reportPortalAppender(layout, timezoneOffset) {
    // This is the appender function itself
    return loggingEvent => {
      if (this.agent) {
        const logLevel = loggingEvent.level;
        const { currentItem } = this.agent.agentContex.getItem();
        const ctx = this.agent.agentContex;
        const currentState = ctx.state.getCurrentState();
        const isTestItem = currentState === 'TEST' || currentState === 'STEP';
        const isValidToSendLogData = currentItem && isTestItem;
        if (isValidToSendLogData) {
          this.agent.client.sendLog(currentItem, {
            message: layout(loggingEvent, timezoneOffset),
            level: logLevel.levelStr,
          });
        }
      }
    };
  }
  configure(config, layouts) {
    // the default layout for the appender
    let layout = layouts.colouredLayout;
    // check if there is another layout specified
    if (config.layout) {
      // load the layout
      layout = layouts.layout(config.layout.type, config.layout);
    }
    //create a new appender instance
    return this.reportPortalAppender(layout, config.timezoneOffset);
  }
}

exports.Log4jsReportPortal = Log4jsReportPortal;
