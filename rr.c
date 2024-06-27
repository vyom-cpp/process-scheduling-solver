#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_PROCESSES 10

typedef struct
{
    int pid;
    int arrival_time;
    int burst_time;
    int remaining_time;
    int completion_time;
    int turnaround_time;
    int waiting_time;
} Process;

void round_robin(Process proc[], int n, int quantum);
void display(Process proc[], int n);

int main()
{
    Process proc[MAX_PROCESSES];
    int n, quantum;

    printf("Enter the number of processes: ");
    scanf("%d", &n);
    printf("Enter the time quantum: ");
    scanf("%d", &quantum);

    for (int i = 0; i < n; i++)
    {
        proc[i].pid = i + 1;
        printf("Enter arrival time and burst time for process %d: ", i + 1);
        scanf("%d%d", &proc[i].arrival_time, &proc[i].burst_time);
        proc[i].remaining_time = proc[i].burst_time;
    }

    round_robin(proc, n, quantum);
    display(proc, n);

    return 0;
}

void round_robin(Process proc[], int n, int quantum)
{
    int time = 0, completed = 0;
    int queue[MAX_PROCESSES];
    int front = 0, rear = 0;
    bool in_queue[MAX_PROCESSES] = {false};

    while (completed < n)
    {
        bool added_to_queue = false;

        for (int i = 0; i < n; i++)
        {
            if (proc[i].arrival_time <= time && !in_queue[i] && proc[i].remaining_time > 0)
            {
                queue[rear] = i;
                rear = (rear + 1) % MAX_PROCESSES;
                in_queue[i] = true;
                added_to_queue = true;
            }
        }

        if (front != rear)
        {
            int idx = queue[front];
            front = (front + 1) % MAX_PROCESSES;
            in_queue[idx] = false;

            if (proc[idx].remaining_time <= quantum)
            {
                time += proc[idx].remaining_time;
                proc[idx].remaining_time = 0;
                proc[idx].completion_time = time;
                proc[idx].turnaround_time = proc[idx].completion_time - proc[idx].arrival_time;
                proc[idx].waiting_time = proc[idx].turnaround_time - proc[idx].burst_time;
                completed++;
            }
            else
            {
                time += quantum;
                proc[idx].remaining_time -= quantum;
                queue[rear] = idx;
                rear = (rear + 1) % MAX_PROCESSES;
                in_queue[idx] = true;
            }
        }
        else if (!added_to_queue)
        {
            time++;
        }
    }
}

void display(Process proc[], int n)
{
    int total_turnaround_time = 0;
    int total_waiting_time = 0;

    printf("\nPID\tArrival\tBurst\tCompletion\tTurnaround\tWaiting\n");
    for (int i = 0; i < n; i++)
    {
        printf("%d\t%d\t%d\t%d\t\t%d\t\t%d\n",
               proc[i].pid, proc[i].arrival_time, proc[i].burst_time,
               proc[i].completion_time, proc[i].turnaround_time, proc[i].waiting_time);
        total_turnaround_time += proc[i].turnaround_time;
        total_waiting_time += proc[i].waiting_time;
    }

    printf("\nAverage Turnaround Time: %.2f\n", (float)total_turnaround_time / n);
    printf("Average Waiting Time: %.2f\n", (float)total_waiting_time / n);
}