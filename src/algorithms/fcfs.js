const fcfs = (arrivalTime, burstTime) => {
  const processesInfo = arrivalTime
    .map((item, index) => {
      const job =
        arrivalTime.length > 26
          ? `P${index + 1}`
          : (index + 10).toString(36).toUpperCase();

      return {
        job,
        at: item,
        bt: burstTime[index],
      };
    })
    .sort((obj1, obj2) => {
      if (obj1.at > obj2.at) {
        return 1;
      }
      if (obj1.at < obj2.at) {
        return -1;
      }
      return 0;
    });

  let finishTime = [];
  let ganttChartInfo = [];

  const solvedProcessesInfo = processesInfo.map((process, index) => {
    if (index === 0 || process.at > finishTime[index - 1]) {
      finishTime[index] = process.at + process.bt;

      ganttChartInfo.push({
        job: process.job,
        start: process.at,
        stop: finishTime[index],
      });
    } else {
      finishTime[index] = finishTime[index - 1] + process.bt;

      ganttChartInfo.push({
        job: process.job,
        start: finishTime[index - 1],
        stop: finishTime[index],
      });
    }

    return {
      ...process,
      ft: finishTime[index],
      tat: finishTime[index] - process.at,
      wat: finishTime[index] - process.at - process.bt,
    };
  });

  return { solvedProcessesInfo, ganttChartInfo };
};



// Test cases
const arrivalTime1 = [0, 1, 3, 9, 10];
const burstTime1 = [4, 5, 3, 8, 2];
console.log("Test Case 1:");
console.log(fcfs(arrivalTime1, burstTime1));

const arrivalTime2 = [0, 2, 5, 9, 12];
const burstTime2 = [6, 2, 4, 5, 3];
console.log("Test Case 2:");
console.log(fcfs(arrivalTime2, burstTime2));