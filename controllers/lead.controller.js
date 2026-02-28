const LeadModel = require("../models/lead.model");
const NoteModel = require("../models/Note.model");
const ActivityLogModel = require("../models/Activitylog.model");
const FollowUpModel = require("../models/FollowUp.model");
const TagModel = require("../models/Tag.model");

class LeadController {

     static async getAllLeads(req, res) {
        try {
            const { status, source, search, page, limit } = req.query;

            const data = await LeadModel.findAll({
                role: req.user.role,
                userId: req.user.id,
                status,
                source,
                search,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
            });

            return res.status(200).json(data);
        } catch (err) {
            console.error("GetAllLeads Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    static async getLeadById(req, res) {
        try {
            const lead = await LeadModel.findById(req.params.id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            if (req.user.role === "member" && lead.assigned_to !== req.user.id) {
                return res.status(403).json({ message: "Access denied." });
            }

            const tags = await TagModel.findByLeadId(lead.id);

            return res.status(200).json({ ...lead, tags });
        } catch (err) {
            console.error("GetLeadById Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // POST /api/leads
    // -----------------------------------------------
    static async createLead(req, res) {
        try {
            const { name, email, phone, company, requirement, source, status, deal_value, assigned_to, tags } = req.body;

            if (!name) return res.status(400).json({ message: "Lead name is required." });

            // Duplicate check
            if (phone || email) {
                const duplicate = await LeadModel.findDuplicate(phone, email);
                if (duplicate) {
                    return res.status(409).json({ message: "Lead with this phone or email already exists.", existing_id: duplicate.id });
                }
            }

            // Create lead
            const leadId = await LeadModel.create({
                name, email, phone, company, requirement,
                source, status, deal_value, assigned_to,
                created_by: req.user.id,
            });

            // Add tags if provided
            if (tags && tags.length > 0) {
                await TagModel.addTags(leadId, tags);
            }

            // Log activity
            await ActivityLogModel.create({
                lead_id: leadId,
                performed_by: req.user.id,
                action_type: "lead_created",
                description: `Lead created by ${req.user.name}`,
            });

            const newLead = await LeadModel.findById(leadId);
            return res.status(201).json({ message: "Lead created successfully.", lead: newLead });

        } catch (err) {
            console.error("CreateLead Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // PUT /api/leads/:id
    // -----------------------------------------------
    static async updateLead(req, res) {
        try {
            const { id } = req.params;
            const lead = await LeadModel.findById(id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            // Member sirf apna assigned lead update kar sakta hai
            if (req.user.role === "member" && lead.assigned_to !== req.user.id) {
                return res.status(403).json({ message: "Access denied." });
            }

            const { name, email, phone, company, requirement, source, status, deal_value, assigned_to, tags } = req.body;

            // Log status change separately
            if (status && status !== lead.status) {
                await ActivityLogModel.create({
                    lead_id: id,
                    performed_by: req.user.id,
                    action_type: "status_changed",
                    description: `Status changed from "${lead.status}" to "${status}" by ${req.user.name}`,
                });
            }

            // Log assignment change
            if (assigned_to && assigned_to !== lead.assigned_to) {
                await ActivityLogModel.create({
                    lead_id: id,
                    performed_by: req.user.id,
                    action_type: "lead_assigned",
                    description: `Lead reassigned by ${req.user.name}`,
                });
            }

            await LeadModel.update(id, { name, email, phone, company, requirement, source, status, deal_value, assigned_to });

            // Update tags if provided
            if (tags) {
                await TagModel.removeAll(id);
                await TagModel.addTags(id, tags);
            }

            // General update log
            await ActivityLogModel.create({
                lead_id: id,
                performed_by: req.user.id,
                action_type: "lead_updated",
                description: `Lead updated by ${req.user.name}`,
            });

            const updatedLead = await LeadModel.findById(id);
            const updatedTags = await TagModel.findByLeadId(id);

            return res.status(200).json({ message: "Lead updated successfully.", lead: { ...updatedLead, tags: updatedTags } });

        } catch (err) {
            console.error("UpdateLead Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // DELETE /api/leads/:id  → Admin only
    // -----------------------------------------------
    static async deleteLead(req, res) {
        try {
            const lead = await LeadModel.findById(req.params.id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            await LeadModel.delete(req.params.id);
            return res.status(200).json({ message: "Lead deleted successfully." });

        } catch (err) {
            console.error("DeleteLead Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // POST /api/leads/:id/notes
    // -----------------------------------------------
    static async addNote(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;

            if (!note) return res.status(400).json({ message: "Note is required." });

            const lead = await LeadModel.findById(id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            // Member sirf apne assigned lead mein note add kar sakta hai
            if (req.user.role === "member" && lead.assigned_to !== req.user.id) {
                return res.status(403).json({ message: "Access denied." });
            }

            const noteId = await NoteModel.create({ lead_id: id, user_id: req.user.id, note });

            // Log
            await ActivityLogModel.create({
                lead_id: id,
                performed_by: req.user.id,
                action_type: "note_added",
                description: `Note added by ${req.user.name}`,
            });

            const notes = await NoteModel.findByLeadId(id);
            return res.status(201).json({ message: "Note added successfully.", notes });

        } catch (err) {
            console.error("AddNote Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // GET /api/leads/:id/notes
    // -----------------------------------------------
    static async getNotes(req, res) {
        try {
            const lead = await LeadModel.findById(req.params.id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            const notes = await NoteModel.findByLeadId(req.params.id);
            return res.status(200).json(notes);
        } catch (err) {
            console.error("GetNotes Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // DELETE /api/leads/:id/notes/:noteId
    // -----------------------------------------------
    static async deleteNote(req, res) {
        try {
            const note = await NoteModel.findById(req.params.noteId);
            if (!note) return res.status(404).json({ message: "Note not found." });

            // Only note owner ya admin delete kar sakta hai
            if (req.user.role === "member" && note.user_id !== req.user.id) {
                return res.status(403).json({ message: "You can only delete your own notes." });
            }

            await NoteModel.delete(req.params.noteId);
            return res.status(200).json({ message: "Note deleted successfully." });
        } catch (err) {
            console.error("DeleteNote Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // GET /api/leads/:id/activity
    // -----------------------------------------------
    static async getActivity(req, res) {
        try {
            const lead = await LeadModel.findById(req.params.id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            const logs = await ActivityLogModel.findByLeadId(req.params.id);
            return res.status(200).json(logs);
        } catch (err) {
            console.error("GetActivity Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // POST /api/leads/:id/followups
    // -----------------------------------------------
    static async addFollowUp(req, res) {
        try {
            const { id } = req.params;
            const { follow_up_date, note, assigned_to } = req.body;

            if (!follow_up_date) return res.status(400).json({ message: "follow_up_date is required." });

            const lead = await LeadModel.findById(id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            await FollowUpModel.create({
                lead_id: id,
                assigned_to: assigned_to || req.user.id,
                follow_up_date,
                note,
            });

            // Log
            await ActivityLogModel.create({
                lead_id: id,
                performed_by: req.user.id,
                action_type: "followup_scheduled",
                description: `Follow-up scheduled for ${follow_up_date} by ${req.user.name}`,
            });

            const followUps = await FollowUpModel.findByLeadId(id);
            return res.status(201).json({ message: "Follow-up scheduled.", followUps });

        } catch (err) {
            console.error("AddFollowUp Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // GET /api/leads/:id/followups
    // -----------------------------------------------
    static async getFollowUps(req, res) {
        try {
            const lead = await LeadModel.findById(req.params.id);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            const followUps = await FollowUpModel.findByLeadId(req.params.id);
            return res.status(200).json(followUps);
        } catch (err) {
            console.error("GetFollowUps Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // PUT /api/leads/followups/:followUpId/done
    // -----------------------------------------------
    static async markFollowUpDone(req, res) {
        try {
            const followUp = await FollowUpModel.findById(req.params.followUpId);
            if (!followUp) return res.status(404).json({ message: "Follow-up not found." });

            await FollowUpModel.markDone(req.params.followUpId);

            // Log
            await ActivityLogModel.create({
                lead_id: followUp.lead_id,
                performed_by: req.user.id,
                action_type: "followup_done",
                description: `Follow-up marked as done by ${req.user.name}`,
            });

            return res.status(200).json({ message: "Follow-up marked as done." });
        } catch (err) {
            console.error("MarkFollowUpDone Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // GET /api/leads/followups/today
    // -----------------------------------------------
    static async getTodayFollowUps(req, res) {
        try {
            const followUps = await FollowUpModel.getTodayFollowUps(req.user.id, req.user.role);
            return res.status(200).json({ total: followUps.length, followUps });
        } catch (err) {
            console.error("TodayFollowUps Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // POST /api/leads/:id/tags
    // -----------------------------------------------
    static async addTags(req, res) {
        try {
            const { tags } = req.body;
            if (!tags || tags.length === 0) return res.status(400).json({ message: "Tags array is required." });

            await TagModel.addTags(req.params.id, tags);
            const updatedTags = await TagModel.findByLeadId(req.params.id);

            return res.status(200).json({ message: "Tags added.", tags: updatedTags });
        } catch (err) {
            console.error("AddTags Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // DELETE /api/leads/:id/tags/:tag
    // -----------------------------------------------
    static async removeTag(req, res) {
        try {
            await TagModel.removeTag(req.params.id, req.params.tag);
            const updatedTags = await TagModel.findByLeadId(req.params.id);
            return res.status(200).json({ message: "Tag removed.", tags: updatedTags });
        } catch (err) {
            console.error("RemoveTag Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // POST /api/leads/import  → CSV bulk import
    // -----------------------------------------------
    static async importLeads(req, res) {
        try {
            const { leads } = req.body; // Array of lead objects

            if (!leads || !Array.isArray(leads) || leads.length === 0) {
                return res.status(400).json({ message: "leads array is required." });
            }

            // Inject created_by for all leads
            const leadsWithCreator = leads.map((l) => ({ ...l, created_by: req.user.id }));
            const results = await LeadModel.bulkCreate(leadsWithCreator);

            return res.status(200).json({
                message: "Import completed.",
                ...results,
            });
        } catch (err) {
            console.error("ImportLeads Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }
}

module.exports = LeadController;