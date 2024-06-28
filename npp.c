#include <stdio.h>
#include <stdlib.h>

#define MAX_PROCESSES 10

typedef struct
{
    int pid;
    int arrival_time;
    int burst_time;
    int priority;
    int completion_time;
    int turnaround_time;
    int waiting_time;
    int is_completed;
} Process;

void sort_by_arrival_time(Process proc[], int n);
void priority_non_preemptive(Process proc[], int n);
void display(Process proc[], int n);

int main()
{
    Process proc[MAX_PROCESSES];
    int n;

    printf("Enter the number of processes: ");
    scanf("%d", &n);

    for (int i = 0; i < n; i++)
    {
        proc[i].pid = i + 1;
        printf("Enter arrival time, burst time, and priority for process %d: ", i + 1);
        scanf("%d%d%d", &proc[i].arrival_time, &proc[i].burst_time, &proc[i].priority);
        proc[i].is_completed = 0;
    }

    priority_non_preemptive(proc, n);
    display(proc, n);

    return 0;
}

void sort_by_arrival_time(Process proc[], int n)
{
    Process temp;
    for (int i = 0; i < n - 1; i++)
    {
        for (int j = 0; j < n - i - 1; j++)
        {
            if (proc[j].arrival_time > proc[j + 1].arrival_time)
            {
                temp = proc[j];
                proc[j] = proc[j + 1];
                proc[j + 1] = temp;
            }
        }
    }
}

void priority_non_preemptive(Process proc[], int n)
{
    sort_by_arrival_time(proc, n);
    int time = 0, completed = 0;
    while (completed < n)
    {
        int highest_priority_idx = -1;
        for (int i = 0; i < n; i++)
        {
            if (proc[i].arrival_time <= time && !proc[i].is_completed)
            {
                if (highest_priority_idx == -1 || proc[i].priority < proc[highest_priority_idx].priority)
                {
                    highest_priority_idx = i;
                }
            }
        }

        if (highest_priority_idx != -1)
        {
            time += proc[highest_priority_idx].burst_time;
            proc[highest_priority_idx].completion_time = time;
            proc[highest_priority_idx].turnaround_time = proc[highest_priority_idx].completion_time - proc[highest_priority_idx].arrival_time;
            proc[highest_priority_idx].waiting_time = proc[highest_priority_idx].turnaround_time - proc[highest_priority_idx].burst_time;
            proc[highest_priority_idx].is_completed = 1;
            completed++;
        }
        else
        {
            time++;
        }
    }
}

void display(Process proc[], int n)
{
    int total_turnaround_time = 0;
    int total_waiting_time = 0;

    printf("\nPID\tArrival\tBurst\tPriority\tCompletion\tTurnaround\tWaiting\n");
    for (int i = 0; i < n; i++)
    {
        printf("%d\t%d\t%d\t%d\t\t%d\t\t%d\t\t%d\n",
               proc[i].pid, proc[i].arrival_time, proc[i].burst_time,
               proc[i].priority, proc[i].completion_time,
               proc[i].turnaround_time, proc[i].waiting_time);
        total_turnaround_time += proc[i].turnaround_time;
        total_waiting_time += proc[i].waiting_time;
    }

    printf("\nAverage Turnaround Time: %.2f\n", (float)total_turnaround_time / n);
    printf("Average Waiting Time: %.2f\n", (float)total_waiting_time / n);
}