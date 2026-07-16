const asyncHandler = require('express-async-handler');
const Client = require('../models/Client');
const User = require('../models/User');
const { Ticket } = require('../models/Misc');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');
const { ROLES } = require('../config/roles');

const getClients = asyncHandler(async (req, res) => {
  const baseQuery = Client.find().populate('user', 'name email phone isActive').populate('projects', 'name status');
  const features = new APIFeatures(baseQuery, req.query).filter().search(['companyName']).sort().paginate();

  const clients = await features.query;
  const meta = await features.countTotal(Client);

  res.status(200).json(new ApiResponse(200, 'Clients fetched', clients, meta));
});

const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id)
    .populate('user', 'name email phone isActive')
    .populate('projects')
    .populate('documents');
  if (!client) throw new ApiError(404, 'Client not found');
  res.status(200).json(new ApiResponse(200, 'Client fetched', client));
});

// @route  GET /api/clients/me — the logged-in client's own profile (invoices, documents, projects)
const getMyClientProfile = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ user: req.user._id })
    .populate('projects', 'name status progress deadline')
    .populate('documents');
  if (!client) throw new ApiError(404, 'Client profile not found for this account');
  res.status(200).json(new ApiResponse(200, 'Profile fetched', client));
});

// @route  POST /api/clients — creates the User account (role: client) + Client profile together
const createClient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, companyName, contactPerson, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, 'A user with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.CLIENT,
    isEmailVerified: true,
    createdBy: req.user._id,
  });

  const client = await Client.create({
    user: user._id,
    companyName,
    contactPerson,
    address,
  });

  res.status(201).json(new ApiResponse(201, 'Client created successfully', client));
});

const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!client) throw new ApiError(404, 'Client not found');
  res.status(200).json(new ApiResponse(200, 'Client updated successfully', client));
});

const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!client) throw new ApiError(404, 'Client not found');
  res.status(200).json(new ApiResponse(200, 'Client deactivated successfully'));
});

// @route  POST /api/clients/:id/invoices
const addInvoice = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) throw new ApiError(404, 'Client not found');

  client.invoices.push(req.body);
  await client.save();
  res.status(201).json(new ApiResponse(201, 'Invoice added', client.invoices));
});

// ---------- Support Tickets ----------

// @route  POST /api/clients/tickets — client raises a support ticket
const raiseTicket = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ user: req.user._id });
  if (!client) throw new ApiError(404, 'Client profile not found for this account');

  const ticketNumber = `TCK-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const ticket = await Ticket.create({
    ticketNumber,
    raisedBy: client._id,
    ...req.body,
  });

  res.status(201).json(new ApiResponse(201, 'Support ticket raised', ticket));
});

// @route  GET /api/clients/tickets/mine
const getMyTickets = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ user: req.user._id });
  if (!client) throw new ApiError(404, 'Client profile not found for this account');

  const tickets = await Ticket.find({ raisedBy: client._id }).sort('-createdAt');
  res.status(200).json(new ApiResponse(200, 'Your tickets fetched', tickets));
});

// @route  GET /api/clients/tickets — support/admin view of all tickets
const getAllTickets = asyncHandler(async (req, res) => {
  const baseQuery = Ticket.find()
    .populate('raisedBy', 'companyName')
    .populate('assignedTo', 'employeeId user');
  const features = new APIFeatures(baseQuery, req.query).filter().sort().paginate();

  const tickets = await features.query;
  const meta = await features.countTotal(Ticket);

  res.status(200).json(new ApiResponse(200, 'Tickets fetched', tickets, meta));
});

// @route  PATCH /api/clients/tickets/:id/reply
const replyToTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  ticket.replies.push({ author: req.user._id, message: req.body.message });
  if (req.body.status) ticket.status = req.body.status;
  await ticket.save();

  res.status(200).json(new ApiResponse(200, 'Reply added', ticket));
});

module.exports = {
  getClients,
  getClientById,
  getMyClientProfile,
  createClient,
  updateClient,
  deleteClient,
  addInvoice,
  raiseTicket,
  getMyTickets,
  getAllTickets,
  replyToTicket,
};
