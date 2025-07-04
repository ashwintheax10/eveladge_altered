input = int(input("Enter a value:"))
for i in range(0,input+1):
    for j in range(0,i):
        print(chr(65+j),end=" ")
    print()
