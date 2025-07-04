import random
number=int(input("Guess a number:"))
guess=random.randint(1,10)
if guess==number:
    print("You guessed it right")
else:
    print("Better luck next time")
print("My guess was",guess)
