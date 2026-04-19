import { DonationInput } from "@/lib/types";

function contains(input: string, words: string[]) {
  const lower = input.toLowerCase();
  return words.some((word) => lower.includes(word));
}

export function buildDonorImpactMessage(input: DonationInput) {
  const itemName = input.itemName.trim();

  if (contains(itemName, ["coffee table", "table", "desk"])) {
    return "Your donation can help a family create a more welcoming space to gather, work, or share a meal.";
  }

  if (contains(itemName, ["sofa", "chair", "stool", "bench"])) {
    return "Your donation can help someone furnish a home with a comfortable place to sit and rest.";
  }

  if (contains(itemName, ["lamp", "light", "shade"])) {
    return "Your donation can brighten someone’s home and make a room feel safer and more comfortable.";
  }

  if (contains(itemName, ["jacket", "coat", "hoodie", "sweater"])) {
    return "Your donation can help someone stay warm and feel prepared for the season ahead.";
  }

  if (contains(itemName, ["shirt", "top", "blouse", "dress", "jeans", "pants", "skirt"])) {
    return "Your donation can help someone feel confident in everyday clothing they can truly use.";
  }

  if (contains(itemName, ["shoe", "sneaker", "boot", "sandal"])) {
    return "Your donation can help someone step into daily life with reliable footwear.";
  }

  if (contains(itemName, ["book", "novel"])) {
    return "Your donation can place a good read into someone’s hands and open the door to learning or escape.";
  }

  if (contains(itemName, ["toy", "game", "puzzle"])) {
    return "Your donation can bring a little joy and play into a child’s day.";
  }

  if (contains(itemName, ["phone", "laptop", "tablet", "headphone", "monitor"])) {
    return "Your donation can help someone stay connected, learn, or work with the tools they need.";
  }

  switch (input.category) {
    case "home":
      return "Your donation can help turn an empty space into a more comfortable home.";
    case "clothing":
      return "Your donation can help someone find clothing that feels useful, comfortable, and dignified.";
    case "accessories":
      return "Your donation can help someone add practical everyday essentials to their routine.";
    case "electronics":
      return "Your donation can help someone access tools that support daily life, learning, or work.";
    case "books":
      return "Your donation can help share knowledge, comfort, or inspiration with a new reader.";
    case "toys":
      return "Your donation can help create moments of joy for a child or family.";
    default:
      return "Your donation can make a useful item available to someone who truly needs it.";
  }
}
