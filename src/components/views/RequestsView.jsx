import React, { useState } from 'react';
import { Plus, ThumbsUp, Mail, X, Lightbulb } from 'lucide-react';
import { useKitchenData } from '../../hooks/useKitchenData.jsx';
import { useToast } from '../ui/ToastProvider';
import { RequestForm, ScheduleRequestForm, VoteDialog, MessageDialog } from '../forms/RequestForm';
import { ConfirmDialog } from '../ui/Modal';

export function RequestsView() {
  const {
    requests,
    votes,
    familyMembers,
    addRequest,
    scheduleRequest,
    deleteRequest,
    voteOnRequest,
    messageRequestCreator
  } = useKitchenData();
  const { toast } = useToast();

  const [requestTab, setRequestTab] = useState('pending');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [schedulingRequest, setSchedulingRequest] = useState(null);
  const [votingRequest, setVotingRequest] = useState(null);
  const [messagingRequest, setMessagingRequest] = useState(null);
  const [deletingRequest, setDeletingRequest] = useState(null);

  const filteredRequests = requests.filter(r => {
    if (requestTab === 'pending') return r.status === 'pending';
    if (requestTab === 'scheduled') return r.status === 'scheduled';
    return true;
  });

  const getVotersForRequest = (requestId) => {
    return votes.filter(v => v.request_id === requestId);
  };

  const handleAddRequest = async (data) => {
    if (familyMembers.length === 0) {
      toast.warning('Please add family members first!');
      return;
    }
    const { error } = await addRequest(data.meal, data.requestorName);
    if (error) {
      toast.error('Failed to add request');
    } else {
      toast.success('Meal request added!');
    }
  };

  const handleScheduleRequest = async (data) => {
    const { error } = await scheduleRequest(data.requestId, data.date, data.chefId, data.time);
    if (error) {
      toast.error(error.message || 'Failed to schedule');
    } else {
      toast.success('Meal scheduled!');
    }
  };

  const handleVote = async (data) => {
    const { error } = await voteOnRequest(data.requestId, data.voterName);
    if (error) {
      toast.warning(error.message);
    } else {
      toast.success('Vote added!');
    }
  };

  const handleMessage = async (data) => {
    const { error } = await messageRequestCreator(data.request, data.senderName, data.message);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Message sent to ${data.request.requested_by}!`);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deletingRequest) return;
    const { error } = await deleteRequest(deletingRequest.id);
    if (error) {
      toast.error('Failed to delete request');
    } else {
      toast.success(
        deletingRequest.status === 'scheduled'
          ? 'Moved back to pending'
          : 'Request deleted'
      );
    }
    setDeletingRequest(null);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Meal Requests</h1>
          <p className="text-sm md:text-base text-gray-600">Suggest and vote on meal ideas</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Request a Meal
        </button>
      </div>

      {/* Tabs & Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {['pending', 'scheduled', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setRequestTab(tab)}
              className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 font-medium text-sm md:text-base whitespace-nowrap capitalize ${
                requestTab === tab
                  ? 'text-orange-700 border-b-2 border-orange-700'
                  : 'text-stone-600'
              }`}
            >
              {tab === 'all' ? 'All Requests' : tab}
            </button>
          ))}
        </div>

        {/* Request List */}
        <div className="p-4 md:p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {requestTab} requests</h3>
              <p className="text-gray-600 mb-4">Be the first to suggest a meal!</p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Request Your First Meal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(request => {
                const requestVoters = getVotersForRequest(request.id);
                return (
                  <div
                    key={request.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative group"
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => setDeletingRequest(request)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                      title={request.status === 'scheduled' ? 'Unschedule and move to pending' : 'Delete request'}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                      <div className="flex-1 pr-8 md:pr-0">
                        <h4 className="font-semibold text-gray-900">{request.meal}</h4>
                        <p className="text-sm text-gray-600">Requested by {request.requested_by}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Vote Button */}
                        <button
                          onClick={() => setVotingRequest(request)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow"
                          title="Vote for this meal"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-semibold">{request.votes}</span>
                        </button>

                        {/* Message Button */}
                        <button
                          onClick={() => setMessagingRequest(request)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow"
                          title="Message the requester"
                        >
                          <Mail className="w-4 h-4" />
                        </button>

                        {/* Schedule/Status */}
                        {request.status === 'pending' && (
                          <button
                            onClick={() => setSchedulingRequest(request)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow text-sm font-medium"
                          >
                            Schedule
                          </button>
                        )}
                        {request.status === 'scheduled' && (
                          <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium text-center">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Voters */}
                    {requestVoters.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">Voted by:</span>
                        <div className="flex flex-wrap gap-1">
                          {requestVoters.map(vote => (
                            <span
                              key={vote.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {vote.voter_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSubmit={handleAddRequest}
        familyMembers={familyMembers}
      />

      <ScheduleRequestForm
        isOpen={!!schedulingRequest}
        onClose={() => setSchedulingRequest(null)}
        onSubmit={handleScheduleRequest}
        familyMembers={familyMembers}
        request={schedulingRequest}
      />

      <VoteDialog
        isOpen={!!votingRequest}
        onClose={() => setVotingRequest(null)}
        onSubmit={handleVote}
        familyMembers={familyMembers}
        request={votingRequest}
      />

      <MessageDialog
        isOpen={!!messagingRequest}
        onClose={() => setMessagingRequest(null)}
        onSubmit={handleMessage}
        familyMembers={familyMembers}
        request={messagingRequest}
      />

      <ConfirmDialog
        isOpen={!!deletingRequest}
        onClose={() => setDeletingRequest(null)}
        onConfirm={handleDeleteRequest}
        title={deletingRequest?.status === 'scheduled' ? 'Unschedule Request' : 'Delete Request'}
        message={
          deletingRequest?.status === 'scheduled'
            ? 'Unschedule this meal and move it back to pending?'
            : 'Are you sure you want to delete this request?'
        }
        confirmText={deletingRequest?.status === 'scheduled' ? 'Unschedule' : 'Delete'}
        variant="danger"
      />
    </div>
  );
}
