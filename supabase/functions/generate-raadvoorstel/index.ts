import { createClient } from "npm:@supabase/supabase-js@2";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "npm:docx@8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// District code to name mapping
const DISTRICT_NAMES: Record<string, string> = {
  PAR: "Paramaribo",
  WAA: "Wanica",
  NIC: "Nickerie",
  COR: "Coronie",
  SAR: "Saramacca",
  COM: "Commewijne",
  MAR: "Marowijne",
  BRO: "Brokopondo",
  SIP: "Sipaliwini",
  PRA: "Para",
};

interface PersonData {
  first_name: string;
  last_name: string;
  national_id: string;
}

interface HouseholdData {
  id: string;
  household_size: number;
}

interface AddressData {
  address_line_1: string;
  address_line_2: string | null;
}

interface ReportData {
  report_json: Record<string, unknown>;
  is_finalized: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_MISSING", message: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user and verify allowlist
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_INVALID", message: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Allowlist check
    if (user.email !== "info@devmart.sr") {
      console.error("Forbidden: User not in allowlist:", user.email);
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_FORBIDDEN", message: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { case_id } = body;

    // Validate case_id UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!case_id || !uuidRegex.test(case_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "VALIDATION_UUID", message: "Invalid case_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for data operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch case with related data
    const { data: caseData, error: caseError } = await adminClient
      .from("subsidy_case")
      .select(`
        id,
        case_number,
        status,
        district_code,
        requested_amount,
        approved_amount,
        created_at,
        person:applicant_person_id (first_name, last_name, national_id),
        household:household_id (id, household_size)
      `)
      .eq("id", case_id)
      .single();

    if (caseError || !caseData) {
      console.error("Case not found:", caseError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "CASE_NOT_FOUND", message: "Case not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract person and household from joined data (Supabase returns objects for single relations)
    const personData = caseData.person as unknown as PersonData;
    const householdData = caseData.household as unknown as HouseholdData;

    if (!personData || !householdData) {
      return new Response(
        JSON.stringify({ success: false, error: "CASE_INCOMPLETE", message: "Case missing person or household data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate case status (must be approved_for_council, council_doc_generated, or finalized)
    const eligibleStatuses = ["approved_for_council", "council_doc_generated", "finalized"];
    if (!eligibleStatuses.includes(caseData.status)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "CASE_NOT_ELIGIBLE", 
          message: `Case must be in status: ${eligibleStatuses.join(", ")}. Current status: ${caseData.status}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch address
    const { data: addressData } = await adminClient
      .from("address")
      .select("address_line_1, address_line_2")
      .eq("household_id", householdData.id)
      .eq("is_current", true)
      .single();

    const address = addressData as AddressData | null;

    // Fetch social report
    const { data: socialReport } = await adminClient
      .from("social_report")
      .select("report_json, is_finalized")
      .eq("case_id", case_id)
      .single();

    // Fetch technical report
    const { data: technicalReport } = await adminClient
      .from("technical_report")
      .select("report_json, is_finalized")
      .eq("case_id", case_id)
      .single();

    // Prepare template variables
    const generationDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const applicationDate = new Date(caseData.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const applicantFullName = `${personData.first_name} ${personData.last_name}`;
    const districtName = DISTRICT_NAMES[caseData.district_code] || caseData.district_code;
    const addressFull = address
      ? `${address.address_line_1}${address.address_line_2 ? ", " + address.address_line_2 : ""}`
      : "Address not available";

    const requestedAmount = caseData.requested_amount
      ? `SRD ${caseData.requested_amount.toLocaleString()}`
      : "Not specified";

    const approvedAmount = caseData.approved_amount
      ? `SRD ${caseData.approved_amount.toLocaleString()}`
      : "Pending determination";

    const budgetYear = new Date().getFullYear().toString();

    // Extract report summaries with fallbacks
    const socialSummary = (socialReport as ReportData | null)?.report_json?.vulnerability_summary as string
      || (socialReport as ReportData | null)?.report_json?.summary as string
      || "Social assessment completed. Details available in full social report.";

    const technicalSummary = (technicalReport as ReportData | null)?.report_json?.housing_condition as string
      || (technicalReport as ReportData | null)?.report_json?.summary as string
      || "Technical inspection completed. Details available in full technical report.";

    // Generate DOCX document
    const doc = new Document({
      creator: "VolksHuisvesting IMS",
      title: `Council Proposal - ${caseData.case_number}`,
      description: "Raadvoorstel generated by VolksHuisvesting IMS",
      sections: [
        {
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: "Council Proposal (Raadvoorstel)",
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),

            // Document Metadata
            new Paragraph({
              children: [
                new TextRun({ text: "Document Metadata", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Document Type: ", bold: true }),
                new TextRun("Council Proposal (Raadvoorstel)"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Module: ", bold: true }),
                new TextRun("Construction Subsidy (Bouwsubsidie)"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Generated By: ", bold: true }),
                new TextRun("VolksHuisvesting IMS"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Generation Date: ", bold: true }),
                new TextRun(generationDate),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Case Reference: ", bold: true }),
                new TextRun(caseData.case_number),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Status: ", bold: true }),
                new TextRun({ text: "CONCEPT – SUBJECT TO MINISTERIAL APPROVAL", bold: true, color: "FF0000" }),
              ],
            }),
            new Paragraph({ text: "" }),

            // Section 1: Introduction
            new Paragraph({
              children: [
                new TextRun({ text: "1. Introduction", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: "Pursuant to the housing policy of the Ministry of Social Affairs and Housing, and in accordance with the applicable regulations, the following proposal is hereby submitted for consideration.",
            }),
            new Paragraph({
              text: "This proposal concerns a request for construction subsidy (Bouwsubsidie) submitted by the applicant identified below.",
            }),
            new Paragraph({ text: "" }),

            // Section 2: Applicant Information
            new Paragraph({
              children: [
                new TextRun({ text: "2. Applicant Information", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Applicant Name: ", bold: true }),
                new TextRun(applicantFullName),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "National ID Number: ", bold: true }),
                new TextRun(personData.national_id),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Household Composition: ", bold: true }),
                new TextRun(`${householdData.household_size} persons`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Residential District: ", bold: true }),
                new TextRun(districtName),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Residential Address: ", bold: true }),
                new TextRun(addressFull),
              ],
            }),
            new Paragraph({ text: "" }),

            // Section 3: Application Overview
            new Paragraph({
              children: [
                new TextRun({ text: "3. Application Overview", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Application Reference Number: ", bold: true }),
                new TextRun(caseData.case_number),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Date of Application: ", bold: true }),
                new TextRun(applicationDate),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Reason for Application: ", bold: true }),
                new TextRun("Construction Subsidy Request"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Requested Subsidy Amount: ", bold: true }),
                new TextRun(requestedAmount),
              ],
            }),
            new Paragraph({ text: "" }),

            // Section 4: Assessment Summary
            new Paragraph({
              children: [
                new TextRun({ text: "4. Assessment Summary", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "4.1 Social Assessment", bold: true, size: 22 }),
              ],
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: "Based on the social field assessment conducted, the applicant's household situation can be summarized as follows:",
            }),
            new Paragraph({
              text: socialSummary,
              spacing: { before: 100, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "4.2 Technical Assessment", bold: true, size: 22 }),
              ],
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: "Based on the technical inspection, the current condition of the dwelling and estimated construction costs are summarized as follows:",
            }),
            new Paragraph({
              text: technicalSummary,
              spacing: { before: 100, after: 100 },
            }),
            new Paragraph({ text: "" }),

            // Section 5: Evaluation and Considerations
            new Paragraph({
              children: [
                new TextRun({ text: "5. Evaluation and Considerations", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: "Taking into account:" }),
            new Paragraph({
              text: "• The applicant's household circumstances",
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "• The condition of the dwelling",
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "• The applicable housing subsidy guidelines",
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "• The available budgetary provisions",
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "it is considered that the application meets the criteria for further consideration.",
              spacing: { before: 100 },
            }),
            new Paragraph({ text: "" }),

            // Section 6: Proposed Decision
            new Paragraph({
              children: [
                new TextRun({ text: "6. Proposed Decision", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: "It is proposed that:" }),
            new Paragraph({
              children: [
                new TextRun("• A "),
                new TextRun({ text: "construction subsidy", bold: true }),
                new TextRun(" in the amount of "),
                new TextRun({ text: approvedAmount, bold: true }),
                new TextRun(" be granted to the applicant;"),
              ],
            }),
            new Paragraph({
              text: "• The subsidy be allocated in accordance with the applicable procedures and conditions;",
            }),
            new Paragraph({
              text: "• The responsible departments be instructed to execute the decision accordingly.",
            }),
            new Paragraph({ text: "" }),

            // Section 7: Budgetary Impact
            new Paragraph({
              children: [
                new TextRun({ text: "7. Budgetary Impact", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun("The proposed subsidy amount shall be charged to the designated housing subsidy budget line for the fiscal year "),
                new TextRun({ text: budgetYear, bold: true }),
                new TextRun("."),
              ],
            }),
            new Paragraph({ text: "" }),

            // Section 8: Conclusion
            new Paragraph({
              children: [
                new TextRun({ text: "8. Conclusion", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: "In view of the above, approval of this proposal is respectfully requested.",
            }),
            new Paragraph({ text: "" }),

            // Section 9: Approval
            new Paragraph({
              children: [
                new TextRun({ text: "9. Approval", bold: true, size: 24 }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Approved / Not Approved", bold: true }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Minister of Social Affairs and Housing",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Name: ________________________________",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Signature: _____________________________",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Date: _________________________________",
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    });

    // Generate DOCX buffer
    const docBuffer = await Packer.toBuffer(doc);

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const fileName = `Raadvoorstel_${caseData.case_number}_${timestamp}.docx`;
    const filePath = `raadvoorstel/${case_id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await adminClient.storage
      .from("generated-documents")
      .upload(filePath, docBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return new Response(
        JSON.stringify({ success: false, error: "STORAGE_ERROR", message: "Failed to store document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create document record
    const { data: docRecord, error: docError } = await adminClient
      .from("generated_document")
      .insert({
        case_id: case_id,
        document_type: "raadvoorstel",
        file_name: fileName,
        file_path: filePath,
        generated_by: user.id,
      })
      .select()
      .single();

    if (docError) {
      console.error("Document record error:", docError.message);
      return new Response(
        JSON.stringify({ success: false, error: "DATABASE_ERROR", message: "Failed to create document record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signed URL (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from("generated-documents")
      .createSignedUrl(filePath, 3600);

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError.message);
    }

    // Log audit event
    await adminClient.from("audit_event").insert({
      entity_type: "generated_document",
      action: "document_generated",
      entity_id: docRecord.id,
      actor_user_id: user.id,
      actor_role: "admin",
      metadata_json: {
        case_id: case_id,
        case_number: caseData.case_number,
        document_type: "raadvoorstel",
        file_name: fileName,
      },
    });

    console.log(`Raadvoorstel generated: ${fileName} for case ${caseData.case_number}`);

    return new Response(
      JSON.stringify({
        success: true,
        document_id: docRecord.id,
        file_name: fileName,
        download_url: signedUrlData?.signedUrl || null,
        generated_at: docRecord.generated_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "GENERATION_ERROR", message: "Document generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
