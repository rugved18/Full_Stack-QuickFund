import * as userService from "../services/user.service.js";

export const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const dashboard = await userService.getUserDashboard(userId);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: "Failed to load user dashboard", details: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log(currentPassword, newPassword)
    const result = await userService.updatePassword(req.params.id, currentPassword, newPassword);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating password", error: err.message });
  }
};