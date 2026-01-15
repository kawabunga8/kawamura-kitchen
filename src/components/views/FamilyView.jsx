import React, { useState } from 'react';
import { Plus, Users, X, Lightbulb, Edit } from 'lucide-react';

import { useKitchenData } from '../../hooks/useKitchenData.jsx';
import { useToast } from '../ui/ToastProvider';
import { FamilyMemberForm } from '../forms/FamilyMemberForm';
import { ConfirmDialog } from '../ui/Modal';

export function FamilyView() {
  const { familyMembers, addFamilyMember, deleteFamilyMember, updateFamilyMember } = useKitchenData();

  const { toast } = useToast();

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMemberId, setDeletingMemberId] = useState(null);


  const handleAddMember = async (data) => {
    const { error } = await addFamilyMember(data);
    if (error) {
      toast.error('Failed to add family member');
    } else {
      toast.success('Family member added!');
    }
  };

  const handleEditMember = async (data) => {
    const { error } = await updateFamilyMember(editingMember.id, data);
    if (error) {
      toast.error('Failed to update family member');
    } else {
      toast.success('Family member updated!');
    }
    setEditingMember(null);
  };


  const handleDeleteMember = async () => {
    const { error } = await deleteFamilyMember(deletingMemberId);
    if (error) {
      toast.error('Failed to remove family member');
    } else {
      toast.success('Family member removed');
    }
    setDeletingMemberId(null);
  };

  const emailSubscribers = familyMembers.filter(m => m.email_notifications);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Family</h1>
          <p className="text-sm md:text-base text-gray-600">Manage household members</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setShowMemberForm(true);
          }}

          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-amber-100" />
            <span className="text-3xl font-bold text-amber-50">{familyMembers.length}</span>
          </div>
          <div className="text-sm text-orange-100">Total Members</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-amber-50">{emailSubscribers.length}</span>
          </div>
          <div className="text-sm text-emerald-100">Email Alerts</div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-amber-50">0</span>
          </div>
          <div className="text-sm text-orange-100">SMS Alerts</div>
        </div>
      </div>

      {/* Family Members List */}
      {familyMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No family members yet</h3>
          <p className="text-gray-600 mb-4">Add your household members to start coordinating dinners</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {familyMembers.map(member => (
            <div
              key={member.id}
              className="bg-amber-50 rounded-xl border-2 border-stone-300 shadow-lg p-4 md:p-6 transition-transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow ${member.color ? `bg-${member.color === 'green' ? 'emerald' : member.color}-600` : 'bg-gradient-to-br from-red-600 to-orange-700'
                  }`}>
                  {member.name ? member.name[0] : '?'}
                </div>


                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <div className="flex gap-1 -mt-2 -mr-2">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setShowMemberForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingMemberId(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>


                  {member.email_notifications && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                      Notifications on
                    </span>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📧</span>
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📱</span>
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.preferences && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">PREFERENCES</p>
                        <p className="text-sm text-gray-700">{member.preferences}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">About Notifications</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>Email notifications work right away - send dinner updates directly from the dashboard</li>
              <li>SMS notifications require backend functions</li>
              <li>Family members will receive updates about who is cooking and when dinner is ready</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Member Form */}
      <FamilyMemberForm
        isOpen={showMemberForm}
        onClose={() => {
          setShowMemberForm(false);
          setEditingMember(null);
        }}
        onSubmit={editingMember ? handleEditMember : handleAddMember}
        initialData={editingMember}
      />


      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingMemberId}
        onClose={() => setDeletingMemberId(null)}
        onConfirm={handleDeleteMember}
        title="Remove Family Member"
        message="Are you sure you want to remove this family member?"
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}
