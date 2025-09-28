import { TrainingList } from '../types';

export const defaultList: TrainingList = {
  id: 'default',
  name: 'Ultimate Visual Library (100 Items)',
  creator: 'Visual Library Trainer',
  categories: {
    "Everyday Objects & Props": ["Chair", "Table", "Bed", "Bicycle", "Car", "Smartphone", "Backpack", "Sword", "Gun", "Book"],
    "Animals (Core Set)": ["Cat", "Dog", "Horse", "Lion", "Elephant", "Eagle", "Fish (generic, like salmon)", "Snake", "Owl", "Bear"],
    "People & Archetypes": ["Child", "Old man", "Old woman", "Farmer", "Knight", "Samurai", "Cowboy", "Soldier", "Astronaut", "Superhero"],
    "Costumes & Fashion": ["Business suit", "Casual jeans & t-shirt", "Dress (classic gown)", "Kimono", "Armor (European plate)", "Spacesuit", "Hoodie + sneakers", "Medieval monk robe", "Sports uniform (basketball/football)", "Traditional African attire (dashiki, boubou, etc.)"],
    "Environments / Architecture": ["Tree (oak)", "Mountain", "Beach", "Forest", "Desert dune", "Hut / cottage", "Castle", "Skyscraper", "Temple (Greek or Roman)", "Bridge"],
    "Mythology & Religion": ["Zeus", "Athena", "Thor", "Loki", "Anubis", "Horus", "Quetzalcoatl", "Shiva", "Ganesha", "Buddha"],
    "Pop Culture Cartoons / Characters": ["Mickey Mouse", "Bugs Bunny", "Daffy Duck", "Scooby-Doo", "Homer Simpson", "SpongeBob", "Samurai Jack", "Dexter (Dexter's Lab)", "Powerpuff Girls", "Snow White"],
    "Pop Culture Modern Icons": ["Batman", "Superman", "Spider-Man", "Wonder Woman", "Darth Vader", "Yoda", "Iron Man", "Pikachu", "Mario", "Sonic the Hedgehog"],
    "Fantasy & Sci-Fi Archetypes": ["Dragon", "Griffin", "Unicorn", "Werewolf", "Vampire", "Zombie", "Alien (classic grey)", "Robot", "Spaceship", "Magic staff"],
    "Cultural / Artistic Symbols": ["Skull", "Rose", "Cross", "Yin-Yang", "Lotus flower", "Crown", "Mask (comedy/tragedy)", "Graffiti tag", "Totem pole", "Mandala"]
  }
};