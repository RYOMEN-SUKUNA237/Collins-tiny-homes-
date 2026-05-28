import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userLat = Number(data.lat) || 39.7392;
    const userLng = Number(data.lng) || -104.9903;

    // 1. Fetch all regional agents
    const { data: agents, error: agentErr } = await supabase.from('agents').select('*');
    if (agentErr) throw agentErr;

    let closestAgentId = null;
    let minDistance = Infinity;

    // 2. Proximity calculation to assign the nearest territorial agent
    if (agents && agents.length > 0) {
      for (const agent of agents) {
        const dist = Math.sqrt(
          Math.pow(Number(agent.lat) - userLat, 2) + 
          Math.pow(Number(agent.lng) - userLng, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestAgentId = agent.id;
        }
      }
    }

    const leadId = randomUUID();

    // 3. Register the territorial lead assignment
    const { error: leadErr } = await supabase.from('leads').insert([{
      id: leadId,
      listing_id: data.listingId || null,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone || '',
      unserviced_location: data.unservicedLocation,
      unserviced_lat: userLat,
      unserviced_lng: userLng,
      assigned_agent_id: closestAgentId,
      status: 'new'
    }]);

    if (leadErr) throw leadErr;

    return NextResponse.json({ success: true, leadId, assignedAgentId: closestAgentId });
  } catch (error: any) {
    console.error('Territorial lead API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
