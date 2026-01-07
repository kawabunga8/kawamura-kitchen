import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateKey, convertTo12Hour } from '../lib/utils';
import { CATEGORY_EMOJI } from '../lib/constants';

const KitchenDataContext = createContext(null);

export function KitchenDataProvider({ children }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [dinners, setDinners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, dinnersRes, requestsRes, pantryRes, votesRes] = await Promise.all([
        supabase.from('family_members').select('*').order('id'),
        supabase.from('dinners').select('*').order('date'),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('pantry_items').select('*').order('name'),
        supabase.from('votes').select('*')
      ]);

      if (!membersRes.error && membersRes.data) setFamilyMembers(membersRes.data);
      if (!dinnersRes.error && dinnersRes.data) setDinners(dinnersRes.data);
      if (!requestsRes.error && requestsRes.data) setRequests(requestsRes.data);
      if (!pantryRes.error && pantryRes.data) setPantryItems(pantryRes.data);
      if (!votesRes.error && votesRes.data) setVotes(votesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    loadData();

    const membersSubscription = supabase
      .channel('family_members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, async () => {
        const { data } = await supabase.from('family_members').select('*').order('id');
        if (data) setFamilyMembers(data);
      })
      .subscribe();

    const dinnersSubscription = supabase
      .channel('dinners_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dinners' }, async () => {
        const { data } = await supabase.from('dinners').select('*').order('date');
        if (data) setDinners(data);
      })
      .subscribe();

    const requestsSubscription = supabase
      .channel('requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, async () => {
        const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
        if (data) setRequests(data);
      })
      .subscribe();

    const pantrySubscription = supabase
      .channel('pantry_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pantry_items' }, async () => {
        const { data } = await supabase.from('pantry_items').select('*').order('name');
        if (data) setPantryItems(data);
      })
      .subscribe();

    const votesSubscription = supabase
      .channel('votes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, async () => {
        const { data } = await supabase.from('votes').select('*');
        if (data) setVotes(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(membersSubscription);
      supabase.removeChannel(dinnersSubscription);
      supabase.removeChannel(requestsSubscription);
      supabase.removeChannel(pantrySubscription);
      supabase.removeChannel(votesSubscription);
    };
  }, [loadData]);

  // Email helper
  const sendEmail = async (to, subject, html) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html })
      });

      if (!response.ok) {
        console.error('Failed to send email:', await response.text());
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const notifyFamilyMembers = async (subject, message) => {
    const subscribedMembers = familyMembers.filter(m => m.email_notifications && m.email);
    if (subscribedMembers.length === 0) return;

    const emailPromises = subscribedMembers.map(member =>
      sendEmail(
        member.email,
        subject,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">Kawamura Kitchen</h2>
            <p>Hi ${member.name},</p>
            <p>${message}</p>
            <p style="color: #666; font-size: 14px;">
              You're receiving this because you have email notifications enabled in Kawamura Kitchen.
            </p>
          </div>
        `
      )
    );

    await Promise.all(emailPromises);
  };

  // Family member operations
  const addFamilyMember = async (memberData) => {
    const { error } = await supabase.from('family_members').insert([{
      ...memberData,
      email_notifications: true
    }]);
    return { error };
  };

  const deleteFamilyMember = async (memberId) => {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);
    return { error };
  };

  // Dinner operations
  const addDinner = async (date, meal, chefName, time, notes = '') => {
    const { error } = await supabase.from('dinners').insert([{
      date: formatDateKey(date),
      meal,
      chef: chefName,
      time: convertTo12Hour(time),
      notes
    }]);
    return { error };
  };

  const editDinner = async (dinnerId, updates) => {
    const { error } = await supabase.from('dinners').update({
      ...updates,
      time: updates.time ? convertTo12Hour(updates.time) : undefined
    }).eq('id', dinnerId);
    return { error };
  };

  const deleteDinner = async (dinnerId) => {
    const { error } = await supabase.from('dinners').delete().eq('id', dinnerId);
    return { error };
  };

  // Request operations
  const addRequest = async (meal, requestorName) => {
    const { error } = await supabase.from('requests').insert([{
      meal,
      requested_by: requestorName,
      status: 'pending',
      votes: 0
    }]);

    if (!error) {
      await notifyFamilyMembers(
        `New Meal Request: ${meal}`,
        `<strong>${requestorName}</strong> has requested <strong>${meal}</strong> for an upcoming dinner. Vote on this request in the app!`
      );
    }

    return { error };
  };

  const scheduleRequest = async (requestId, date, chefId, time) => {
    const request = requests.find(r => r.id === requestId);
    const chef = familyMembers.find(m => m.id === chefId);
    if (!request || !chef) return { error: new Error('Invalid request or chef') };

    // Add to dinner schedule
    const { error: dinnerError } = await supabase.from('dinners').insert([{
      date,
      meal: request.meal,
      chef: chef.name,
      time: convertTo12Hour(time)
    }]);

    if (dinnerError) return { error: dinnerError };

    // Mark request as scheduled
    const { error: requestError } = await supabase.from('requests').update({ status: 'scheduled' }).eq('id', requestId);

    // Send email to chef
    if (chef.email && chef.email_notifications) {
      await sendEmail(
        chef.email,
        `You're Cooking: ${request.meal}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">Kawamura Kitchen</h2>
            <p>Hi ${chef.name},</p>
            <p>You've been scheduled to cook <strong>${request.meal}</strong>!</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}<br>
            <strong>Time:</strong> ${convertTo12Hour(time)}</p>
            <p style="color: #666; font-size: 14px;">
              You're receiving this because you have email notifications enabled in Kawamura Kitchen.
            </p>
          </div>
        `
      );
    }

    return { error: requestError };
  };

  const deleteRequest = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return { error: new Error('Request not found') };

    if (request.status === 'scheduled') {
      // Move back to pending
      const { error } = await supabase.from('requests').update({ status: 'pending' }).eq('id', requestId);
      return { error };
    } else {
      // Delete completely
      const { error } = await supabase.from('requests').delete().eq('id', requestId);
      return { error };
    }
  };

  const voteOnRequest = async (requestId, voterName) => {
    // Check if already voted
    const existingVote = votes.find(v => v.request_id === requestId && v.voter_name === voterName);
    if (existingVote) {
      return { error: new Error(`${voterName} has already voted for this meal!`) };
    }

    // Add vote
    const { error: voteError } = await supabase.from('votes').insert([{
      request_id: requestId,
      voter_name: voterName
    }]);

    if (voteError) return { error: voteError };

    // Update vote count
    const currentVotes = votes.filter(v => v.request_id === requestId).length + 1;
    const { error } = await supabase.from('requests').update({ votes: currentVotes }).eq('id', requestId);
    return { error };
  };

  const messageRequestCreator = async (request, senderName, message) => {
    const creator = familyMembers.find(m => m.name === request.requested_by);

    if (!creator) return { error: new Error(`Could not find ${request.requested_by} in family members.`) };
    if (!creator.email) return { error: new Error(`${creator.name} does not have an email address set up.`) };
    if (!creator.email_notifications) return { error: new Error(`${creator.name} has email notifications disabled.`) };

    await sendEmail(
      creator.email,
      `Message about your request: ${request.meal}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">Kawamura Kitchen</h2>
          <p>Hi ${creator.name},</p>
          <p><strong>${senderName}</strong> sent you a message about your meal request "<strong>${request.meal}</strong>":</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            You're receiving this because you have email notifications enabled in Kawamura Kitchen.
          </p>
        </div>
      `
    );

    return { error: null };
  };

  // Pantry operations
  const addPantryItem = async (itemData) => {
    const { data, error } = await supabase.from('pantry_items').insert([{
      ...itemData,
      low_stock: false
    }]).select();
    return { data, error };
  };

  const editPantryItem = async (itemId, updates) => {
    const { error } = await supabase.from('pantry_items').update(updates).eq('id', itemId);
    return { error };
  };

  const deletePantryItem = async (itemId) => {
    const { error } = await supabase.from('pantry_items').delete().eq('id', itemId);
    return { error };
  };

  const toggleLowStock = async (itemId) => {
    const item = pantryItems.find(i => i.id === itemId);
    if (!item) return { error: new Error('Item not found') };

    const newLowStockStatus = !item.low_stock;
    const { error } = await supabase.from('pantry_items').update({ low_stock: newLowStockStatus }).eq('id', itemId);

    // Send email to Shingo if item became low stock
    if (!error && newLowStockStatus) {
      const shingo = familyMembers.find(m => m.name === 'Shingo');
      if (shingo && shingo.email && shingo.email_notifications) {
        const emoji = CATEGORY_EMOJI[item.category || 'pantry'] || '📦';
        await sendEmail(
          shingo.email,
          `Low Stock Alert: ${item.name}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ea580c;">Kawamura Kitchen</h2>
              <p>Hi ${shingo.name},</p>
              <p>${emoji} <strong>${item.name}</strong> is running low!</p>
              <p><strong>Current quantity:</strong> ${item.quantity}</p>
              <p>Please add it to your shopping list.</p>
              <p style="color: #666; font-size: 14px;">
                You're receiving this because you have email notifications enabled in Kawamura Kitchen.
              </p>
            </div>
          `
        );
      }
    }

    return { error };
  };

  const value = {
    // Data
    familyMembers,
    dinners,
    requests,
    pantryItems,
    votes,
    loading,

    // Family operations
    addFamilyMember,
    deleteFamilyMember,

    // Dinner operations
    addDinner,
    editDinner,
    deleteDinner,

    // Request operations
    addRequest,
    scheduleRequest,
    deleteRequest,
    voteOnRequest,
    messageRequestCreator,

    // Pantry operations
    addPantryItem,
    editPantryItem,
    deletePantryItem,
    toggleLowStock,

    // Utilities
    sendEmail,
    notifyFamilyMembers,
    loadData
  };

  return (
    <KitchenDataContext.Provider value={value}>
      {children}
    </KitchenDataContext.Provider>
  );
}

export function useKitchenData() {
  const context = useContext(KitchenDataContext);
  if (!context) {
    throw new Error('useKitchenData must be used within a KitchenDataProvider');
  }
  return context;
}
