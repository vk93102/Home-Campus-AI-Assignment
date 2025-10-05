
BASE_URL="http://localhost:3001"
USERNAME="script_user_$(date +%s)"
PASSWORD="password123"

print_step() {
    echo ""
    echo "--- $1 ---"
}

# 1. SIGN UP A NEW USER
print_step "1. Signing up a new user: $USERNAME"
signup_response=$(curl -s -X POST -H "Content-Type: application/json" \
-d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" \
$BASE_URL/auth/signup)

echo "Response: $signup_response"
echo "✅ User signup complete."


# 2. LOG IN TO GET A TOKEN
print_step "2. Logging in to get auth token"
login_response=$(curl -s -X POST -H "Content-Type: application/json" \
-d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" \
$BASE_URL/auth/login)

# Extract the token using jq
TOKEN=$(echo $login_response | jq -r .token)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Aborting."
    echo "Response: $login_response"
    exit 1
fi

echo "✅ Login successful. Token obtained."


# 3. CREATE A NEW STUDENT
print_step "3. Creating a new student"
create_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
-d '{"name": "Script Student", "status": "active", "isScholarship": true, "attendancePercentage": 90, "assignmentScore": 85}' \
$BASE_URL/api/students)

# Extract the new student's ID
STUDENT_ID=$(echo $create_response | jq -r .id)
echo "Response: $create_response"
echo "✅ Student created with ID: $STUDENT_ID"


# 4. READ ALL STUDENTS
print_step "4. Reading all students"
read_response=$(curl -s -X GET -H "Authorization: Bearer $TOKEN" $BASE_URL/api/students)
echo "Response: $read_response"
echo "✅ Read operation complete."


# 5. UPDATE THE STUDENT
print_step "5. Updating student with ID: $STUDENT_ID"
update_response=$(curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
-d '{"name": "Script Student Updated", "status": "graduated", "isScholarship": false, "attendancePercentage": 95, "assignmentScore": 99}' \
$BASE_URL/api/students/$STUDENT_ID)
echo "Response: $update_response"
echo "✅ Update operation complete."


# 6. DELETE THE STUDENT
print_step "6. Deleting student with ID: $STUDENT_ID"
delete_response=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN" $BASE_URL/api/students/$STUDENT_ID)
echo "Response: $delete_response"
echo "✅ Delete operation complete."


# 7. FINAL VERIFICATION
print_step "7. Verifying deletion by reading all students again"
final_read=$(curl -s -X GET -H "Authorization: Bearer $TOKEN" $BASE_URL/api/students)
echo "Response: $final_read"
if [ "$final_read" == "[]" ]; then
    echo "✅ Verification successful. The student list is empty as expected."
else
    echo "❌ Verification failed. Student list is not empty."
fi

echo ""
echo "--- Test complete ---"
