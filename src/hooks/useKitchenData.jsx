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
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ to, subject, html })
      });

      if (!response.ok) {
        console.error('Failed to send email:', await response.text());
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // SMS helper
  const sendSMS = async (to, body) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ to, body })
      });
      return await response.json();
    } catch (error) {
      console.error('Error in sendSMS:', error);
      return { error };
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

  const updateFamilyMember = async (memberId, updates) => {
    const { error } = await supabase
      .from('family_members')
      .update(updates)
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

    // Send SMS to chef
    if (chef.phone && chef.sms_notifications !== false) {
      await sendSMS(
        chef.phone,
        `You're Cooking! \nMeal: ${request.meal}\nDate: ${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}\nTime: ${convertTo12Hour(time)}\n- Kawamura Kitchen`
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
    // Sanitize payload: remove id if it's null/undefined/empty to let DB handle auto-increment
    const payload = { ...itemData, low_stock: false };
    if (!payload.id) {
      delete payload.id;
    }

    console.log('Adding pantry item payload:', payload);

    const { data, error } = await supabase.from('pantry_items').insert([
      payload
    ]).select();

    if (error) {
      console.error('Error adding pantry item:', error);
    }

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

  const sendShoppingList = async (targetEmails) => {
    // 1. Get low stock items
    const lowStockItems = pantryItems.filter(item => item.low_stock);
    if (lowStockItems.length === 0) {
      return { error: new Error('No items are low in stock.') };
    }

    // 2. Group by category
    const groupedItems = lowStockItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    // 3. Format HTML list
    const categories = Object.keys(groupedItems).sort();

    const itemsListHtml = categories.map(category => {
      const categoryEmoji = CATEGORY_EMOJI[category] || '📦';
      const items = groupedItems[category];

      const itemsHtml = items.map(item =>
        `<li style="margin-bottom: 4px; color: #374151;">${item.name} <span style="color: #6b7280; font-size: 0.9em;">(Qty: ${item.quantity})</span></li>`
      ).join('');

      return `
        <div style="margin-bottom: 16px;">
          <h3 style="margin: 0 0 8px 0; color: #4b5563; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
            ${categoryEmoji} ${category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>
          <ul style="list-style-type: disc; padding-left: 20px; margin: 0;">
            ${itemsHtml}
          </ul>
        </div>
      `;
    }).join('');

    // 4. Handle multiple recipients
    const emails = Array.isArray(targetEmails) ? targetEmails : [targetEmails];

    // 5. Send emails
    const emailPromises = emails.map(email => sendEmail(
      email,
      'Your Shopping List - Kawamura Kitchen',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Kawamura Kitchen</h2>
          <p style="font-size: 16px;">Here is your shopping list of currently low-stock items, organized by category:</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${itemsListHtml}
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px; font-style: italic;">
             Tip: Add items to the pantry list and mark 'low stock' if it should be added to the shopping list.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 12px; text-align: center;">
            <a href="https://kawamura-kitchen.vercel.app" style="color: #ea580c; text-decoration: none; font-weight: bold;">Open Kawamura Kitchen App</a>
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 12px;">
            Happy Shopping! 🛒
          </p>
        </div>
      `
    ));

    try {
      await Promise.all(emailPromises);
      return { error: null };
    } catch (e) {
      return { error: e };
    }
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
    updateFamilyMember,

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
    sendShoppingList,

    // Utilities

    // Utilities

    sendEmail,
    sendSMS,
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
