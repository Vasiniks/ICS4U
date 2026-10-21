import random

def create_test_values(upper_range, amount):
    a_list = []
    for i in range(amount):
        a_list.append(random.randint(0, upper_range))

    return a_list
    

def counting_sort(a_list):
    
    #create the key or counting array based on max value in list
    counting_list = []
    for i in range(0, max(a_list) + 1):
        counting_list.append(0)

    
    #iterate through given list and increase counters of key
    #for each element in list, increase the respective counter by 1
    for num in a_list:
        counting_list[num] += 1

    #create a new list with values in sorted order based on couters of key
    #for each counter, starting from smallest key
    sorted_list = []
    for i in range(0, len(counting_list)):
        counter = counting_list[i]
        
        #while counter is non-zero
        #restore element to list and decrease counter by 1
        while(counter > 0):
            sorted_list.append(i)
            counter -= 1

    return sorted_list

        
#main
def main():
    
    list_of_numbers = create_test_values(50, 1000)
    list_of_numbers = counting_sort(list_of_numbers)

    print(list_of_numbers)

main()
