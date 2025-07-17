import json

# Load the JSON data (assuming it's stored in a file named 'db.json')
with open('db.json', 'r') as file:
    data = json.load(file)

# Extract the list of valid employee names
valid_employees = data['employees']

# Function to split concatenated employee names
def split_employee_names(employees_field, valid_employees):
    if isinstance(employees_field, list):
        # If it's a list, check each element
        result = []
        for item in employees_field:
            if isinstance(item, str) and ' ' in item:
                # Handle concatenated names in a single list element (e.g., "Tim Ann Nicholas")
                temp_str = item.strip()
                while temp_str:
                    matched = False
                    for emp in valid_employees:
                        if temp_str.startswith(emp):
                            result.append(emp)
                            temp_str = temp_str[len(emp):].strip()
                            matched = True
                            break
                    if not matched:
                        print(f"Warning: Could not match '{temp_str}' in employees list for entry")
                        break
            else:
                # If the item is a single name or not a string, add it as is
                result.append(item)
        return result
    elif isinstance(employees_field, str):
        # Handle case where employees_field is a single concatenated string
        result = []
        temp_str = employees_field.strip()
        while temp_str:
            matched = False
            for emp in valid_employees:
                if temp_str.startswith(emp):
                    result.append(emp)
                    temp_str = temp_str[len(emp):].strip()
                    matched = True
                    break
            if not matched:
                print(f"Warning: Could not match '{temp_str}' in employees list")
                break
        return result
    return employees_field  # Return unchanged if neither string nor list

# Process all entries
for entry in data['entries']:
    entry['employees'] = split_employee_names(entry['employees'], valid_employees)

# Save the modified JSON to a new file
with open('db_modified.json', 'w') as file:
    json.dump(data, file, indent=2)

print("Names in all entries have been separated and saved to 'db_modified.json'.")