a = int(input("Enter an hour :"))
if a>12:
    print(a-12,"pm")
elif a<12:
    print(a,"am")
else:
    print("12 pm")
